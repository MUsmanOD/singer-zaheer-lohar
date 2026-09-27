import mongoose from "mongoose";
import { ApiError } from "@/lib/api/response";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { Playlist } from "@/lib/db/models/Playlist";
import { Setting } from "@/lib/db/models/Setting";
import { SiteVisit } from "@/lib/db/models/SiteVisit";
import { Video } from "@/lib/db/models/Video";
import { getPlaylistBundle, getVideoById, validatePlaylistUrl } from "@/lib/services/youtube";
import { DEFAULT_SOCIAL_LINKS } from "@/lib/social-links";
import { validateSettingsInput } from "@/lib/validators/playlist";

const DEFAULT_SETTINGS = {
  playlistPageTitle: "Playlists",
  playlistPageDescription: "Explore curated playlists, live performances, interviews, concerts, and the songs behind the moments.",
  defaultPlaylistLimit: 12,
  socialLinks: DEFAULT_SOCIAL_LINKS,
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeSlug(title, playlistId) {
  const base = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  return `${base || "playlist"}-${playlistId.toLowerCase()}`;
}

function safeId(id) {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
  }
  return new mongoose.Types.ObjectId(id);
}

function safeVideoId(id) {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError("This video could not be found.", 404, "VIDEO_NOT_FOUND");
  }
  return new mongoose.Types.ObjectId(id);
}

function serializePlaylist(playlist, { publicView = false } = {}) {
  if (!playlist) return null;
  const value = typeof playlist.toObject === "function" ? playlist.toObject() : playlist;
  const result = {
    id: String(value._id || value.id),
    title: value.title,
    slug: value.slug,
    description: value.description || "",
    playlistUrl: value.playlistUrl,
    platform: value.platform,
    thumbnail: value.thumbnail || "",
    videoCount: Number(value.videoCount || 0),
    isFeatured: Boolean(value.isFeatured),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
  if (!publicView) {
    Object.assign(result, {
      externalPlaylistId: value.externalPlaylistId,
      externalTitle: value.externalTitle,
      titleOverride: value.titleOverride,
      descriptionOverride: value.descriptionOverride,
      status: value.status || "active",
      displayOrder: Number(value.displayOrder || 0),
      lastSyncedAt: value.lastSyncedAt,
      syncError: value.syncError || "",
      createdBy: value.createdBy || "",
    });
  }
  return result;
}

function serializeVideo(video) {
  const value = typeof video.toObject === "function" ? video.toObject() : video;
  const playlist = value.playlistId && typeof value.playlistId === "object" && value.playlistId._id && value.playlistId.slug
    ? value.playlistId
    : null;
  const rawPlaylistId = playlist?._id || value.playlistId?._id || value.playlistId;
  return {
    id: String(value._id || value.id),
    externalVideoId: value.externalVideoId,
    title: value.title,
    description: value.description || "",
    thumbnail: value.thumbnail || "",
    duration: value.duration || "",
    position: Number(value.position || 0),
    source: value.source || (value.playlistId ? "playlist" : "manual"),
    status: value.status || "active",
    isFeatured: Boolean(value.isFeatured),
    displayOrder: Number(value.displayOrder || 0),
    publishedAt: value.publishedAt,
    videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(value.externalVideoId)}`,
    playlist: playlist ? {
      id: String(playlist._id),
      title: playlist.title,
      slug: playlist.slug,
    } : null,
    playlistId: rawPlaylistId ? String(rawPlaylistId) : null,
  };
}

function fallbackTransaction(error) {
  return error?.code === 20
    || error?.codeName === "IllegalOperation"
    || /transaction numbers are only allowed|does not support transactions|replica set member or mongos/i.test(error?.message || "");
}

async function withTransaction(work) {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => work(session));
  } catch (error) {
    if (!fallbackTransaction(error)) throw error;
    return await work(null);
  } finally {
    await session.endSession();
  }
}

async function recordActivity(session, adminId, action, resource, resourceId, metadata = {}) {
  const log = new AuditLog({ adminId, action, resource, resourceId: String(resourceId || ""), metadata });
  await log.save(session ? { session } : undefined);
}

async function writeVideos(playlistId, videos, session) {
  const operations = videos.map((video) => ({
    updateOne: {
      filter: { playlistId, externalVideoId: video.externalVideoId },
      update: { $set: { ...video, playlistId, source: "playlist" } },
      upsert: true,
    },
  }));
  if (operations.length) await Video.bulkWrite(operations, session ? { session, ordered: false } : { ordered: false });
  const videoIds = videos.map((video) => video.externalVideoId);
  const staleFilter = videoIds.length ? { playlistId, externalVideoId: { $nin: videoIds } } : { playlistId };
  await Video.deleteMany(staleFilter, session ? { session } : undefined);
}

export async function listPublicPlaylists({ page, limit, search = "", featured = false }) {
  const filter = { status: { $ne: "inactive" } };
  if (featured) filter.isFeatured = true;
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: "i" };
  const [rows, total] = await Promise.all([
    Playlist.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Playlist.countDocuments(filter),
  ]);
  return { rows: rows.map((row) => serializePlaylist(row, { publicView: true })), total };
}

export async function listFeaturedPlaylists() {
  const rows = await Playlist.find({ status: { $ne: "inactive" }, isFeatured: true })
    .sort({ displayOrder: 1, createdAt: -1 }).lean();
  return rows.map((row) => serializePlaylist(row, { publicView: true }));
}

export async function getPublicPlaylist(slug) {
  if (typeof slug !== "string" || slug.length > 180) return null;
  const playlist = await Playlist.findOne({ slug, status: { $ne: "inactive" } }).lean();
  return serializePlaylist(playlist, { publicView: true });
}

export async function listPlaylistVideos(slug, { page, limit }) {
  const playlist = await Playlist.findOne({ slug, status: { $ne: "inactive" } }).select("_id").lean();
  if (!playlist) return null;
  const [rows, total] = await Promise.all([
    Video.find({ playlistId: playlist._id, status: { $ne: "inactive" } }).sort({ position: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Video.countDocuments({ playlistId: playlist._id, status: { $ne: "inactive" } }),
  ]);
  return { rows: rows.map(serializeVideo), total };
}

export async function listPublicVideos({ page, limit, search = "" }) {
  const activePlaylistIds = await Playlist.find({ status: { $ne: "inactive" } }).distinct("_id");
  const filter = {
    status: { $ne: "inactive" },
    $or: [
      { playlistId: { $in: activePlaylistIds } },
      { source: "manual", playlistId: null, isFeatured: true },
    ],
  };
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: "i" };
  const sort = { publishedAt: -1, createdAt: -1, position: 1 };
  const [result] = await Video.aggregate([
    { $match: filter },
    { $sort: sort },
    { $group: { _id: "$externalVideoId", video: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$video" } },
    { $sort: sort },
    { $facet: {
      rows: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: "value" }],
    } },
  ]).allowDiskUse(true);
  const rows = await Video.populate(result?.rows || [], { path: "playlistId", select: "title slug" });
  return { rows: rows.map(serializeVideo), total: result?.total?.[0]?.value || 0 };
}

export async function getRandomPublicVideo() {
  const activePlaylistIds = await Playlist.find({ status: { $ne: "inactive" } }).distinct("_id");
  const [result] = await Video.aggregate([
    { $match: {
      status: { $ne: "inactive" },
      thumbnail: { $nin: ["", null] },
      $or: [
        { playlistId: { $in: activePlaylistIds } },
        { source: "manual", playlistId: null, isFeatured: true },
      ],
    } },
    { $group: { _id: "$externalVideoId", video: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$video" } },
    { $sample: { size: 1 } },
  ]).allowDiskUse(true);
  if (!result) return null;
  const [video] = await Video.populate([result], { path: "playlistId", select: "title slug" });
  return serializeVideo(video);
}

export async function listFeaturedVideos({ limit = 8 } = {}) {
  const activePlaylistIds = await Playlist.find({ status: { $ne: "inactive" } }).distinct("_id");
  const sort = { displayOrder: 1, publishedAt: -1, createdAt: -1, position: 1 };
  const result = await Video.aggregate([
    { $match: {
    status: { $ne: "inactive" },
    isFeatured: true,
    $or: [
      { playlistId: { $in: activePlaylistIds } },
      { source: "manual", playlistId: null },
    ],
    } },
    { $sort: sort },
    { $group: { _id: "$externalVideoId", video: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$video" } },
    { $sort: sort },
    { $limit: Math.max(1, Math.min(Number(limit) || 8, 24)) },
  ]).allowDiskUse(true);
  const rows = await Video.populate(result || [], { path: "playlistId", select: "title slug" });
  return rows.map(serializeVideo);
}

export async function listAdminPlaylists({ page, limit, search = "", status = "", featured = "", platform = "", sort = "newest" }) {
  const filter = {};
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: "i" };
  if (status && status !== "all") {
    if (!["active", "inactive"].includes(status)) throw new ApiError("Choose active or inactive status.", 400, "INVALID_STATUS");
    filter.status = status === "active" ? { $ne: "inactive" } : status;
  }
  if (featured && featured !== "all") {
    if (!["true", "false"].includes(featured)) throw new ApiError("Choose a valid featured filter.", 400, "INVALID_FILTER");
    filter.isFeatured = featured === "true";
  }
  if (platform && platform !== "all") {
    if (platform !== "youtube") throw new ApiError("This platform is not supported.", 400, "INVALID_PLATFORM");
    filter.platform = platform;
  }
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    order: { displayOrder: 1, createdAt: -1 },
    title: { title: 1 },
  };
  if (!sortOptions[sort]) throw new ApiError("Choose a valid sort order.", 400, "INVALID_SORT");
  const [rows, total] = await Promise.all([
    Playlist.find(filter).sort(sortOptions[sort]).skip((page - 1) * limit).limit(limit).lean(),
    Playlist.countDocuments(filter),
  ]);
  return { rows: rows.map(serializePlaylist), total };
}

export async function getAdminPlaylist(id) {
  return serializePlaylist(await Playlist.findById(safeId(id)).lean());
}

export async function createPlaylist(input, adminId) {
  const { playlistId, playlistUrl } = validatePlaylistUrl(input.playlistUrl);
  if (await Playlist.exists({ externalPlaylistId: playlistId })) {
    throw new ApiError("This playlist is already in your library.", 409, "DUPLICATE_PLAYLIST");
  }
  const synced = await getPlaylistBundle(playlistId);
  if (input.status === "inactive" && input.isFeatured) {
    throw new ApiError("Make a playlist active before featuring it.", 422, "INACTIVE_PLAYLIST_CANNOT_BE_FEATURED");
  }
  const titleOverride = input.title || null;
  const descriptionOverride = input.description === undefined ? null : input.description;
  const playlist = new Playlist({
    externalTitle: synced.title,
    externalDescription: synced.description,
    title: titleOverride || synced.title,
    titleOverride,
    description: descriptionOverride ?? synced.description,
    descriptionOverride,
    slug: makeSlug(titleOverride || synced.title, playlistId),
    playlistUrl,
    platform: "youtube",
    externalPlaylistId: playlistId,
    thumbnail: synced.thumbnail,
    videoCount: synced.videos.length,
    status: input.status || "active",
    isFeatured: Boolean(input.isFeatured),
    displayOrder: input.displayOrder ?? 0,
    lastSyncedAt: new Date(),
    createdBy: adminId,
  });

  await withTransaction(async (session) => {
    await playlist.save(session ? { session } : undefined);
    await writeVideos(playlist._id, synced.videos, session);
    await recordActivity(session, adminId, "playlist.created", "playlist", playlist._id, { title: playlist.title });
  });
  return serializePlaylist(playlist);
}

export async function updatePlaylist(id, input, adminId, activityAction = "playlist.updated") {
  const objectId = safeId(id);
  const playlist = await Playlist.findById(objectId);
  if (!playlist) throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");

  if (input.title !== undefined) {
    playlist.titleOverride = input.title || null;
    playlist.title = playlist.titleOverride || playlist.externalTitle;
  }
  if (input.description !== undefined) {
    playlist.descriptionOverride = input.description;
    playlist.description = input.description;
  }
  if (input.status !== undefined) {
    playlist.status = input.status;
    if (input.status === "inactive") playlist.isFeatured = false;
  }
  if (input.isFeatured !== undefined) {
    if (input.isFeatured && playlist.status !== "active") {
      throw new ApiError("Make a playlist active before featuring it.", 422, "INACTIVE_PLAYLIST_CANNOT_BE_FEATURED");
    }
    playlist.isFeatured = input.isFeatured;
  }
  if (input.displayOrder !== undefined) playlist.displayOrder = input.displayOrder;

  await withTransaction(async (session) => {
    await playlist.save(session ? { session } : undefined);
    await recordActivity(session, adminId, activityAction, "playlist", playlist._id, {
      title: playlist.title,
      status: playlist.status,
      isFeatured: playlist.isFeatured,
      displayOrder: playlist.displayOrder,
    });
  });
  return serializePlaylist(playlist);
}

export async function deletePlaylist(id, adminId) {
  const objectId = safeId(id);
  await withTransaction(async (session) => {
    const playlist = await Playlist.findById(objectId).session(session);
    if (!playlist) throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
    if (session) {
      await Video.deleteMany({ playlistId: objectId }, { session });
      await playlist.deleteOne({ session });
    } else {
      await Video.deleteMany({ playlistId: objectId });
      await playlist.deleteOne();
    }
    await recordActivity(session, adminId, "playlist.deleted", "playlist", objectId, { title: playlist.title });
  });
}

export async function refreshPlaylist(id, adminId) {
  const objectId = safeId(id);
  const playlist = await Playlist.findById(objectId);
  if (!playlist) throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
  let synced;
  try {
    synced = await getPlaylistBundle(playlist.externalPlaylistId);
  } catch (error) {
    playlist.syncError = error instanceof ApiError ? error.message : "YouTube synchronization failed.";
    await playlist.save();
    throw error;
  }

  await withTransaction(async (session) => {
    playlist.externalTitle = synced.title;
    playlist.externalDescription = synced.description;
    playlist.title = playlist.titleOverride || synced.title;
    playlist.description = playlist.descriptionOverride ?? synced.description;
    playlist.thumbnail = synced.thumbnail;
    playlist.videoCount = synced.videos.length;
    playlist.lastSyncedAt = new Date();
    playlist.syncError = "";
    await playlist.save(session ? { session } : undefined);
    await writeVideos(playlist._id, synced.videos, session);
    await recordActivity(session, adminId, "playlist.refreshed", "playlist", playlist._id, { title: playlist.title, videoCount: playlist.videoCount });
  });
  return serializePlaylist(playlist);
}

export async function setPlaylistStatus(id, status, adminId) {
  if (!["active", "inactive"].includes(status)) throw new ApiError("Choose active or inactive status.", 422, "INVALID_STATUS");
  return updatePlaylist(id, { status }, adminId, "playlist.status_changed");
}

export async function setPlaylistFeatured(id, isFeatured, adminId) {
  if (typeof isFeatured !== "boolean") throw new ApiError("Featured must be true or false.", 422, "INVALID_FEATURED_STATE");
  return updatePlaylist(id, { isFeatured }, adminId, isFeatured ? "playlist.featured" : "playlist.unfeatured");
}

export async function reorderPlaylists(items, adminId) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) {
    throw new ApiError("Include between 1 and 100 playlists to reorder.", 422, "INVALID_REORDER");
  }
  const normalized = items.map((item) => {
    if (!item || typeof item !== "object" || Object.keys(item).some((key) => !["id", "displayOrder"].includes(key))) {
      throw new ApiError("Each item needs an ID and display order.", 422, "INVALID_REORDER");
    }
    return { id: safeId(item.id), displayOrder: item.displayOrder };
  });
  if (normalized.some((item) => !Number.isInteger(item.displayOrder) || item.displayOrder < 0 || item.displayOrder > 100000)) {
    throw new ApiError("Display order must be a whole number from 0 to 100,000.", 422, "INVALID_DISPLAY_ORDER");
  }
  const ids = normalized.map((item) => String(item.id));
  if (new Set(ids).size !== ids.length) throw new ApiError("A playlist can only appear once in an ordering update.", 422, "DUPLICATE_REORDER_ID");

  await withTransaction(async (session) => {
    const existing = await Playlist.find({ _id: { $in: normalized.map((item) => item.id) } }).select("_id").session(session);
    if (existing.length !== normalized.length) throw new ApiError("One or more playlists could not be found.", 404, "PLAYLIST_NOT_FOUND");
    const operations = normalized.map((item) => ({ updateOne: { filter: { _id: item.id }, update: { $set: { displayOrder: item.displayOrder } } } }));
    await Playlist.bulkWrite(operations, session ? { session } : {});
    await recordActivity(session, adminId, "playlists.reordered", "playlist", "", { count: normalized.length });
  });
}

export async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [totalPlaylists, activePlaylists, featuredPlaylists, totalVideos, totalVisits, todayVisits, uniqueVisitors, recentVisits, recentlyAdded, recentlyUpdated, activity] = await Promise.all([
    Playlist.countDocuments({}),
    Playlist.countDocuments({ status: { $ne: "inactive" } }),
    Playlist.countDocuments({ status: { $ne: "inactive" }, isFeatured: true }),
    Video.countDocuments({}),
    SiteVisit.countDocuments({}),
    SiteVisit.countDocuments({ createdAt: { $gte: startOfToday } }),
    SiteVisit.distinct("ipHash").then((items) => items.length),
    SiteVisit.find({}).sort({ createdAt: -1 }).limit(5).select("path createdAt").lean(),
    Playlist.find({}).sort({ createdAt: -1 }).limit(5).select("title slug thumbnail createdAt status").lean(),
    Playlist.find({}).sort({ updatedAt: -1 }).limit(5).select("title slug thumbnail updatedAt status").lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(8).select("action resource resourceId metadata createdAt adminId").lean(),
  ]);
  return {
    totalPlaylists,
    activePlaylists,
    featuredPlaylists,
    totalVideos,
    totalVisits,
    todayVisits,
    uniqueVisitors,
    recentVisits: recentVisits.map((item) => ({ id: String(item._id), path: item.path, createdAt: item.createdAt })),
    recentlyAdded: recentlyAdded.map((item) => ({ id: String(item._id), title: item.title, slug: item.slug, thumbnail: item.thumbnail, createdAt: item.createdAt, status: item.status || "active" })),
    recentlyUpdated: recentlyUpdated.map((item) => ({ id: String(item._id), title: item.title, slug: item.slug, thumbnail: item.thumbnail, updatedAt: item.updatedAt, status: item.status || "active" })),
    activity: activity.map((item) => ({ action: item.action, resource: item.resource, resourceId: item.resourceId, title: item.metadata?.title || "", createdAt: item.createdAt, adminId: item.adminId })),
  };
}

export async function listAdminVideos({ page, limit, search = "", playlistId = "", status = "" }) {
  const filter = {};
  if (playlistId) {
    filter.playlistId = safeId(playlistId);
  }
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: "i" };
  if (status && status !== "all") {
    if (!["active", "inactive"].includes(status)) throw new ApiError("Choose active or inactive status.", 400, "INVALID_STATUS");
    filter.status = status === "active" ? { $ne: "inactive" } : status;
  }
  const [rows, total] = await Promise.all([
    Video.find(filter).populate("playlistId", "title slug").sort({ updatedAt: -1, position: 1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    Video.countDocuments(filter),
  ]);
  return { rows: rows.map(serializeVideo), total };
}

export async function createManualVideo(input, adminId) {
  if (await Video.exists({ externalVideoId: input.externalVideoId })) {
    throw new ApiError("This video is already in your library. Use its featured star in the video list instead.", 409, "DUPLICATE_VIDEO");
  }

  const details = await getVideoById(input.externalVideoId);
  const title = typeof details.title === "string" ? details.title.trim().slice(0, 300) : "";
  if (!title) {
    throw new ApiError("YouTube did not return a title for this video. Check that the video is public and try again.", 422, "INVALID_VIDEO_METADATA");
  }
  const publishedAtValue = details.publishedAt ? new Date(details.publishedAt) : null;
  const publishedAt = publishedAtValue && Number.isFinite(publishedAtValue.getTime()) ? publishedAtValue : null;
  const video = new Video({
    playlistId: null,
    source: "manual",
    externalVideoId: input.externalVideoId,
    title,
    description: typeof details.description === "string" ? details.description.slice(0, 5000) : "",
    thumbnail: typeof details.thumbnail === "string" ? details.thumbnail.slice(0, 2048) : "",
    duration: typeof details.duration === "string" ? details.duration.slice(0, 30) : "",
    position: 0,
    status: input.status || "active",
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
    publishedAt,
  });

  try {
    await video.validate();
  } catch (error) {
    if (error?.name === "ValidationError") {
      const invalidFields = Object.keys(error.errors || {});
      const safeFields = invalidFields.filter((field) => ["externalVideoId", "title", "description", "thumbnail", "duration", "position", "status", "isFeatured", "displayOrder", "publishedAt"].includes(field));
      throw new ApiError(
        safeFields.length
          ? `YouTube returned video details that could not be saved (${safeFields.join(", ")}). Check that the video is public and try again.`
          : "YouTube returned video details that could not be saved. Check that the video is public and try again.",
        422,
        "INVALID_VIDEO_METADATA",
      );
    }
    throw error;
  }

  try {
    await withTransaction(async (session) => {
      await video.save(session ? { session } : undefined);
      await recordActivity(session, adminId, "video.created", "video", video._id, {
        title: video.title,
        externalVideoId: video.externalVideoId,
        status: video.status,
        isFeatured: video.isFeatured,
      });
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError("This video is already in your library. Use its featured star in the video list instead.", 409, "DUPLICATE_VIDEO");
    }
    if (error?.name === "ValidationError") {
      throw new ApiError("The video details could not be saved. Check that the YouTube link points to a public video and try again.", 422, "INVALID_VIDEO_METADATA");
    }
    throw error;
  }
  return serializeVideo(video);
}

export async function setVideoFeatured(id, isFeatured, adminId) {
  if (typeof isFeatured !== "boolean") {
    throw new ApiError("Featured must be true or false.", 422, "INVALID_FEATURED_STATE");
  }
  const objectId = safeVideoId(id);
  let result;

  await withTransaction(async (session) => {
    let query = Video.findById(objectId);
    if (session) query = query.session(session);
    const video = await query;
    if (!video) throw new ApiError("This video could not be found.", 404, "VIDEO_NOT_FOUND");

    if (isFeatured && video.status === "inactive") {
      throw new ApiError("Activate the video before featuring it.", 422, "INACTIVE_VIDEO_CANNOT_BE_FEATURED");
    }

    if (isFeatured && video.playlistId) {
      let playlistQuery = Playlist.findOne({ _id: video.playlistId, status: { $ne: "inactive" } });
      if (session) playlistQuery = playlistQuery.session(session);
      if (!await playlistQuery.select("_id")) {
        throw new ApiError("Activate the playlist before featuring one of its videos.", 422, "INACTIVE_PLAYLIST_VIDEO");
      }
    }

    video.isFeatured = isFeatured;
    await video.save(session ? { session } : undefined);
    await recordActivity(session, adminId, isFeatured ? "video.featured" : "video.unfeatured", "video", video._id, {
      title: video.title,
      externalVideoId: video.externalVideoId,
    });
    let updatedQuery = Video.findById(video._id).populate("playlistId", "title slug");
    if (session) updatedQuery = updatedQuery.session(session);
    result = serializeVideo(await updatedQuery.lean());
  });

  return result;
}

export async function getAdminVideo(id) {
  const video = await Video.findById(safeVideoId(id)).populate("playlistId", "title slug").lean();
  return video ? serializeVideo(video) : null;
}

export async function updateVideo(id, input, adminId) {
  const objectId = safeVideoId(id);
  let result;
  await withTransaction(async (session) => {
    let query = Video.findById(objectId);
    if (session) query = query.session(session);
    const video = await query;
    if (!video) throw new ApiError("This video could not be found.", 404, "VIDEO_NOT_FOUND");

    const nextStatus = input.status ?? video.status ?? "active";
    const nextFeatured = input.isFeatured ?? video.isFeatured;
    if (nextStatus === "inactive" && nextFeatured) {
      throw new ApiError("Activate the video before featuring it.", 422, "INACTIVE_VIDEO_CANNOT_BE_FEATURED");
    }
    if (nextFeatured && video.playlistId) {
      let playlistQuery = Playlist.findOne({ _id: video.playlistId, status: { $ne: "inactive" } });
      if (session) playlistQuery = playlistQuery.session(session);
      if (!await playlistQuery.select("_id")) {
        throw new ApiError("Activate the playlist before featuring one of its videos.", 422, "INACTIVE_PLAYLIST_VIDEO");
      }
    }

    Object.assign(video, input);
    if (nextStatus === "inactive") video.isFeatured = false;
    await video.save(session ? { session } : undefined);
    await recordActivity(session, adminId, "video.updated", "video", video._id, {
      title: video.title,
      status: video.status,
      isFeatured: video.isFeatured,
      displayOrder: video.displayOrder,
    });
    let updatedQuery = Video.findById(video._id).populate("playlistId", "title slug");
    if (session) updatedQuery = updatedQuery.session(session);
    result = serializeVideo(await updatedQuery.lean());
  });
  return result;
}

export async function deleteVideo(id, adminId) {
  const objectId = safeVideoId(id);
  await withTransaction(async (session) => {
    let query = Video.findById(objectId);
    if (session) query = query.session(session);
    const video = await query;
    if (!video) throw new ApiError("This video could not be found.", 404, "VIDEO_NOT_FOUND");
    await video.deleteOne(session ? { session } : undefined);
    await recordActivity(session, adminId, "video.deleted", "video", objectId, { title: video.title, externalVideoId: video.externalVideoId });
  });
}

export async function setVideoStatus(id, status, adminId) {
  if (!["active", "inactive"].includes(status)) throw new ApiError("Choose active or inactive status.", 422, "INVALID_STATUS");
  return updateVideo(id, { status }, adminId);
}

export async function getSettings() {
  const docs = await Setting.find({ key: { $in: Object.keys(DEFAULT_SETTINGS) } }).lean();
  const values = { ...DEFAULT_SETTINGS };
  for (const doc of docs) {
    values[doc.key] = doc.key === "socialLinks"
      ? { ...DEFAULT_SOCIAL_LINKS, ...(doc.value || {}) }
      : doc.value;
  }
  return values;
}

export async function updateSettings(body, adminId) {
  const updates = validateSettingsInput(body);
  if (updates.socialLinks) {
    const storedSocialLinks = await Setting.findOne({ key: "socialLinks" }).lean();
    const socialLinks = { ...DEFAULT_SOCIAL_LINKS, ...(storedSocialLinks?.value || {}) };
    for (const [platform, values] of Object.entries(updates.socialLinks)) {
      socialLinks[platform] = { ...socialLinks[platform], ...values };
    }
    updates.socialLinks = socialLinks;
  }
  for (const [key, value] of Object.entries(updates)) {
    await Setting.updateOne({ key }, { $set: { value } }, { upsert: true, runValidators: true });
  }
  await recordActivity(null, adminId, "settings.updated", "settings", "", { changed: Object.keys(updates) });
  return getSettings();
}

export function getIntegrationStatus() {
  return {
    youtubeConfigured: Boolean(process.env.YOUTUBE_API_KEY),
    databaseConfigured: Boolean(process.env.MONGODB_URI),
    authConfigured: Boolean(process.env.SESSION_SECRET?.length >= 32 && (process.env.MONGODB_URI || (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD))),
  };
}
