import { ApiError } from "@/lib/api/response";
import { extractPlaylistId, normalizePlaylistUrl } from "@/lib/validators/playlist";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_SYNC_VIDEOS = 5000;

function unavailableError(message = "YouTube could not provide this playlist right now.") {
  return new ApiError(message, 502, "YOUTUBE_UNAVAILABLE");
}

async function requestYouTube(resource, params) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new ApiError("YouTube integration is not configured. Add YOUTUBE_API_KEY on the server.", 503, "YOUTUBE_NOT_CONFIGURED");
  const query = new URLSearchParams({ ...params, key: apiKey });
  let response;
  try {
    response = await fetch(`${API_BASE}/${resource}?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw unavailableError("YouTube could not be reached. Try again shortly.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason || "";
    if (["quotaExceeded", "dailyLimitExceeded", "rateLimitExceeded"].includes(reason)) {
      throw new ApiError("YouTube's daily data quota has been reached. Try again later.", 429, "YOUTUBE_QUOTA_EXCEEDED");
    }
    if (["playlistNotFound", "forbidden"].includes(reason) || response.status === 404) {
      if (resource === "videos") {
        throw new ApiError("This YouTube video is private, deleted, or unavailable.", 422, "YOUTUBE_VIDEO_UNAVAILABLE");
      }
      throw new ApiError("This playlist is private, deleted, or unavailable.", 422, "YOUTUBE_PLAYLIST_UNAVAILABLE");
    }
    throw unavailableError();
  }
  return payload;
}

function chooseThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";
}

function parseDuration(duration = "") {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return "";
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return [hours ? String(hours) : null, hours ? String(minutes).padStart(2, "0") : String(minutes), String(seconds).padStart(2, "0")]
    .filter(Boolean).join(":");
}

export function validatePlaylistUrl(url) {
  const playlistId = extractPlaylistId(url);
  return { playlistId, playlistUrl: normalizePlaylistUrl(playlistId) };
}

export async function getPlaylist(playlistId) {
  const payload = await requestYouTube("playlists", {
    part: "snippet,contentDetails",
    id: playlistId,
    maxResults: "1",
  });
  const item = payload?.items?.[0];
  if (!item) throw new ApiError("This playlist is private, deleted, or unavailable.", 422, "YOUTUBE_PLAYLIST_UNAVAILABLE");
  return {
    externalPlaylistId: playlistId,
    title: String(item.snippet?.title || "").trim().slice(0, 120) || "Untitled playlist",
    description: String(item.snippet?.description || "").trim().slice(0, 1000),
    thumbnail: chooseThumbnail(item.snippet?.thumbnails),
    videoCount: Number(item.contentDetails?.itemCount || 0),
  };
}

export async function getVideoDetails(videoIds) {
  const videos = [];
  for (let index = 0; index < videoIds.length; index += 50) {
    const batch = videoIds.slice(index, index + 50);
    const payload = await requestYouTube("videos", {
      part: "contentDetails,snippet",
      id: batch.join(","),
      maxResults: "50",
    });
    for (const item of payload?.items || []) {
      videos.push({
        externalVideoId: item.id,
        duration: parseDuration(item.contentDetails?.duration),
        title: String(item.snippet?.title || "Unavailable video").trim().slice(0, 300),
        description: String(item.snippet?.description || "").slice(0, 5000),
        thumbnail: chooseThumbnail(item.snippet?.thumbnails),
        publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
      });
    }
  }
  return videos;
}

export async function getVideoById(videoId) {
  const [video] = await getVideoDetails([videoId]);
  if (!video) {
    throw new ApiError("This YouTube video is private, deleted, or unavailable.", 422, "YOUTUBE_VIDEO_UNAVAILABLE");
  }
  return video;
}

export async function getPlaylistVideos(playlistId) {
  const orderedItems = [];
  let pageToken = "";
  do {
    const params = {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
    };
    if (pageToken) params.pageToken = pageToken;
    const payload = await requestYouTube("playlistItems", params);
    for (const item of payload?.items || []) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      orderedItems.push({
        externalVideoId: videoId,
        title: String(item.snippet?.title || "Unavailable video").trim().slice(0, 300),
        description: String(item.snippet?.description || "").slice(0, 5000),
        thumbnail: chooseThumbnail(item.snippet?.thumbnails),
        publishedAt: item.contentDetails?.videoPublishedAt ? new Date(item.contentDetails.videoPublishedAt) : null,
        position: Number.isInteger(item.snippet?.position) ? item.snippet.position : orderedItems.length,
      });
    }
    pageToken = payload?.nextPageToken || "";
    if (orderedItems.length > MAX_SYNC_VIDEOS) {
      throw new ApiError(`This playlist has more than ${MAX_SYNC_VIDEOS.toLocaleString()} videos, which is above the current sync limit.`, 413, "PLAYLIST_TOO_LARGE");
    }
  } while (pageToken);

  if (!orderedItems.length) return [];
  const details = await getVideoDetails(orderedItems.map((video) => video.externalVideoId));
  const detailById = new Map(details.map((video) => [video.externalVideoId, video]));
  return orderedItems.map((item) => ({ ...item, ...detailById.get(item.externalVideoId), position: item.position }));
}

export async function getPlaylistBundle(playlistId) {
  const [playlist, videos] = await Promise.all([
    getPlaylist(playlistId),
    getPlaylistVideos(playlistId),
  ]);
  return { ...playlist, videos, videoCount: videos.length };
}
