import { ApiError } from "@/lib/api/response";
import { parseYouTubeUrl } from "@/lib/validators/youtube";
const ALLOWED_VIDEO_FIELDS = new Set(["videoUrl", "isFeatured", "displayOrder", "status"]);
const ALLOWED_VIDEO_UPDATE_FIELDS = new Set(["title", "description", "isFeatured", "displayOrder", "status"]);

export function extractVideoId(value) {
  const parsed = parseYouTubeUrl(value);
  if (parsed.type === "playlist") {
    throw new ApiError("This is a YouTube playlist link. Add it from the Playlists page, or paste a video link.", 422, "PLAYLIST_URL_IS_NOT_VIDEO");
  }
  if (parsed.type !== "video") throw new ApiError(parsed.message || "Paste a valid YouTube video link.", 422, "INVALID_VIDEO_URL");
  return parsed.id;
}

export function normalizeVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function validateVideoInput(body) {
  for (const key of Object.keys(body)) {
    if (!ALLOWED_VIDEO_FIELDS.has(key)) {
      throw new ApiError(`The field “${key}” is not supported.`, 400, "UNEXPECTED_FIELD");
    }
  }

  if (typeof body.videoUrl !== "string" || !body.videoUrl.trim()) {
    throw new ApiError("Add a YouTube video link to continue.", 422, "VIDEO_URL_REQUIRED");
  }

  const externalVideoId = extractVideoId(body.videoUrl);
  const isFeatured = body.isFeatured ?? false;
  const displayOrder = body.displayOrder ?? 0;
  const status = body.status ?? "active";
  if (typeof isFeatured !== "boolean") {
    throw new ApiError("Featured must be true or false.", 422, "INVALID_FEATURED_STATE");
  }
  if (!["active", "inactive"].includes(status)) {
    throw new ApiError("Choose active or inactive status.", 422, "INVALID_STATUS");
  }
  if (status === "inactive" && isFeatured) {
    throw new ApiError("Activate a video before featuring it.", 422, "INACTIVE_VIDEO_CANNOT_BE_FEATURED");
  }
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 100000) {
    throw new ApiError("Display order must be a whole number from 0 to 100,000.", 422, "INVALID_DISPLAY_ORDER");
  }

  return {
    externalVideoId,
    videoUrl: normalizeVideoUrl(externalVideoId),
    isFeatured,
    displayOrder,
    status,
  };
}

export function validateVideoUpdate(body) {
  for (const key of Object.keys(body)) {
    if (!ALLOWED_VIDEO_UPDATE_FIELDS.has(key)) {
      throw new ApiError(`The field “${key}” is not supported.`, 400, "UNEXPECTED_FIELD");
    }
  }
  const normalized = {};
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 300) {
      throw new ApiError("Title is required and must be 300 characters or fewer.", 422, "INVALID_TITLE");
    }
    normalized.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.length > 5000) {
      throw new ApiError("Description must be 5,000 characters or fewer.", 422, "INVALID_DESCRIPTION");
    }
    normalized.description = body.description.trim();
  }
  if (body.status !== undefined) {
    if (!["active", "inactive"].includes(body.status)) throw new ApiError("Choose active or inactive status.", 422, "INVALID_STATUS");
    normalized.status = body.status;
  }
  if (body.isFeatured !== undefined) {
    if (typeof body.isFeatured !== "boolean") throw new ApiError("Featured must be true or false.", 422, "INVALID_FEATURED_STATE");
    normalized.isFeatured = body.isFeatured;
  }
  if (body.displayOrder !== undefined) {
    if (!Number.isInteger(body.displayOrder) || body.displayOrder < 0 || body.displayOrder > 100000) throw new ApiError("Display order must be a whole number from 0 to 100,000.", 422, "INVALID_DISPLAY_ORDER");
    normalized.displayOrder = body.displayOrder;
  }
  if (normalized.status === "inactive" && normalized.isFeatured === true) throw new ApiError("Activate a video before featuring it.", 422, "INACTIVE_VIDEO_CANNOT_BE_FEATURED");
  if (Object.keys(normalized).length === 0) throw new ApiError("Add at least one change to save.", 422, "EMPTY_UPDATE");
  return normalized;
}
