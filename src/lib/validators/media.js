import { ApiError } from "@/lib/api/response";
import { parseYouTubeUrl } from "@/lib/validators/youtube";

const ALLOWED_FIELDS = new Set(["videoUrl", "playlistUrl", "title", "description", "isFeatured", "status", "displayOrder"]);

export function parseMediaInput(body) {
  const unexpected = Object.keys(body).find((key) => !ALLOWED_FIELDS.has(key));
  if (unexpected) throw new ApiError("The request contains an unsupported field.", 400, "UNEXPECTED_FIELD");
  if (body.videoUrl !== undefined && body.playlistUrl !== undefined) {
    throw new ApiError("Send one YouTube URL at a time.", 400, "MULTIPLE_MEDIA_URLS");
  }
  const rawUrl = body.videoUrl ?? body.playlistUrl;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) throw new ApiError("Paste a YouTube video or playlist link to continue.", 422, "YOUTUBE_URL_REQUIRED");
  const media = parseYouTubeUrl(rawUrl);
  if (media.type === "invalid") throw new ApiError(media.message, 422, "INVALID_YOUTUBE_URL");
  return { rawUrl, media };
}
