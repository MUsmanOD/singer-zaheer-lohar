import { ApiError } from "@/lib/api/response";
import { parseYouTubeUrl } from "@/lib/validators/youtube";
import { SOCIAL_CHANNEL_BY_KEY, SOCIAL_CHANNELS } from "@/lib/social-links";

const allowedPlaylistFields = new Set(["playlistUrl", "title", "description", "isFeatured", "status", "displayOrder"]);
const allowedSettingsFields = new Set(["playlistPageTitle", "playlistPageDescription", "defaultPlaylistLimit", "socialLinks"]);

export function extractPlaylistId(value) {
  const parsed = parseYouTubeUrl(value);
  if (parsed.type === "video") {
    throw new ApiError("This is a YouTube video link. Add it from the Videos page, or paste a playlist link.", 422, "VIDEO_URL_IS_NOT_PLAYLIST");
  }
  if (parsed.type !== "playlist") throw new ApiError(parsed.message || "Enter a valid YouTube playlist URL.", 422, "INVALID_PLAYLIST_URL");
  return parsed.id;
}

export function normalizePlaylistUrl(playlistId) {
  return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

export function validatePlaylistInput(body, { partial = false, allowUrl = false } = {}) {
  for (const key of Object.keys(body)) {
    if (!allowedPlaylistFields.has(key) || (key === "playlistUrl" && !allowUrl)) {
      throw new ApiError(`The field “${key}” is not supported.`, 400, "UNEXPECTED_FIELD");
    }
  }
  if (!partial && !body.playlistUrl) {
    throw new ApiError("Add a YouTube playlist URL to continue.", 422, "PLAYLIST_URL_REQUIRED");
  }
  if (allowUrl && body.playlistUrl !== undefined) extractPlaylistId(body.playlistUrl);
  const normalized = {};

  for (const key of ["title", "description"]) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== "string") throw new ApiError(`${key === "title" ? "Title" : "Description"} must be text.`, 422, "INVALID_FIELD");
    const value = body[key].trim();
    const maxLength = key === "title" ? 120 : 1000;
    if (value.length > maxLength) throw new ApiError(`${key === "title" ? "Title" : "Description"} must be ${maxLength} characters or fewer.`, 422, "INVALID_FIELD");
    normalized[key] = value;
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
    if (!Number.isInteger(body.displayOrder) || body.displayOrder < 0 || body.displayOrder > 100000) {
      throw new ApiError("Display order must be a whole number from 0 to 100,000.", 422, "INVALID_DISPLAY_ORDER");
    }
    normalized.displayOrder = body.displayOrder;
  }
  if (body.playlistUrl !== undefined) normalized.playlistUrl = body.playlistUrl.trim();
  if (partial && Object.keys(normalized).length === 0) throw new ApiError("Add at least one change to save.", 422, "EMPTY_UPDATE");
  return normalized;
}

export function validateSettingsInput(body) {
  for (const key of Object.keys(body)) {
    if (!allowedSettingsFields.has(key)) throw new ApiError(`The setting “${key}” cannot be changed here.`, 400, "UNEXPECTED_FIELD");
  }
  const output = {};
  if (body.playlistPageTitle !== undefined) {
    if (typeof body.playlistPageTitle !== "string" || !body.playlistPageTitle.trim() || body.playlistPageTitle.trim().length > 80) {
      throw new ApiError("Page title is required and must be 80 characters or fewer.", 422, "INVALID_PAGE_TITLE");
    }
    output.playlistPageTitle = body.playlistPageTitle.trim();
  }
  if (body.playlistPageDescription !== undefined) {
    if (typeof body.playlistPageDescription !== "string" || body.playlistPageDescription.trim().length > 240) {
      throw new ApiError("Page description must be 240 characters or fewer.", 422, "INVALID_PAGE_DESCRIPTION");
    }
    output.playlistPageDescription = body.playlistPageDescription.trim();
  }
  if (body.defaultPlaylistLimit !== undefined) {
    if (!Number.isInteger(body.defaultPlaylistLimit) || body.defaultPlaylistLimit < 1 || body.defaultPlaylistLimit > 48) {
      throw new ApiError("Playlist page size must be between 1 and 48.", 422, "INVALID_PAGE_SIZE");
    }
    output.defaultPlaylistLimit = body.defaultPlaylistLimit;
  }
  if (body.socialLinks !== undefined) {
    if (!body.socialLinks || typeof body.socialLinks !== "object" || Array.isArray(body.socialLinks)) {
      throw new ApiError("Social channel settings must be an object.", 422, "INVALID_SOCIAL_LINKS");
    }
    const allowedPlatforms = new Set(SOCIAL_CHANNELS.map(({ key }) => key));
    const unexpectedPlatform = Object.keys(body.socialLinks).find((key) => !allowedPlatforms.has(key));
    if (unexpectedPlatform) throw new ApiError("That social platform is not supported.", 422, "INVALID_SOCIAL_PLATFORM");

    const socialLinks = {};
    for (const [key, rawEntry] of Object.entries(body.socialLinks)) {
      const platform = SOCIAL_CHANNEL_BY_KEY[key];
      if (!rawEntry || typeof rawEntry !== "object" || Array.isArray(rawEntry)) {
        throw new ApiError(`${platform.label} details must be an object.`, 422, "INVALID_SOCIAL_LINK");
      }
      if (Object.keys(rawEntry).some((field) => !["url", "followers"].includes(field))) {
        throw new ApiError(`${platform.label} only supports a profile URL and audience count.`, 422, "INVALID_SOCIAL_LINK");
      }

      const normalizedEntry = {};
      if (rawEntry.url !== undefined) {
        if (typeof rawEntry.url !== "string" || rawEntry.url.length > 300) {
          throw new ApiError(`${platform.label} URL must be text and 300 characters or fewer.`, 422, "INVALID_SOCIAL_URL");
        }
        if (rawEntry.url !== "") {
          let url;
          try {
            url = new URL(rawEntry.url.trim());
          } catch {
            throw new ApiError(`Enter a valid ${platform.label} profile URL.`, 422, "INVALID_SOCIAL_URL");
          }
          if (url.protocol !== "https:" || !platform.hosts.includes(url.hostname.toLowerCase()) || url.username || url.password || (url.port && url.port !== "443")) {
            throw new ApiError(`Enter a secure ${platform.label} profile URL.`, 422, "INVALID_SOCIAL_URL");
          }
          normalizedEntry.url = url.toString();
        } else {
          normalizedEntry.url = "";
        }
      }

      if (rawEntry.followers !== undefined) {
        const rawFollowers = rawEntry.followers;
        let followers = null;
        if (rawFollowers !== null && rawFollowers !== "") {
          if (!Number.isSafeInteger(rawFollowers) || rawFollowers < 0 || rawFollowers > 1_000_000_000) {
            throw new ApiError(`${platform.countLabel} for ${platform.label} must be a whole number from 0 to 1,000,000,000.`, 422, "INVALID_SOCIAL_COUNT");
          }
          followers = rawFollowers;
        }
        normalizedEntry.followers = followers;
      }
      socialLinks[key] = normalizedEntry;
    }
    output.socialLinks = socialLinks;
  }
  if (!Object.keys(output).length) throw new ApiError("Add at least one setting to save.", 422, "EMPTY_UPDATE");
  return output;
}
