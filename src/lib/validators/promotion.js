import { ApiError } from "@/lib/api/response";

const ALLOWED_FIELDS = new Set([
  "name", "email", "organization", "phone", "platform", "campaignType",
  "campaignWindow", "budget", "profileUrl", "message", "website",
]);
const PLATFORMS = new Set(["youtube", "instagram", "tiktok", "spotify", "facebook", "x", "other"]);
const CAMPAIGN_TYPES = new Set(["music-release", "brand-partnership", "event", "content", "other"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value, label, { max = 160, min = 0 } = {}) {
  if (typeof value !== "string") throw new ApiError(`${label} is required.`, 422, "INVALID_PROMOTION_FIELD");
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ");
  if (normalized.length < min) throw new ApiError(`${label} must be at least ${min} characters.`, 422, "INVALID_PROMOTION_FIELD");
  if (normalized.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`, 422, "INVALID_PROMOTION_FIELD");
  return normalized;
}

export function validatePromotionInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Enter your promotion details to send an inquiry.", 422, "INVALID_PROMOTION");
  }
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) {
    throw new ApiError("The request contains an unsupported field.", 400, "UNEXPECTED_FIELD");
  }
  if (body.website !== undefined && typeof body.website !== "string") {
    throw new ApiError("The request could not be verified.", 422, "INVALID_PROMOTION");
  }

  const name = text(body.name, "Name", { min: 2, max: 120 });
  if (/[<>]/.test(name) || !/[\p{L}\p{N}]/u.test(name)) throw new ApiError("Enter a valid name.", 422, "INVALID_NAME");
  const email = text(body.email, "Email", { min: 3, max: 254 }).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ApiError("Enter a valid email address.", 422, "INVALID_EMAIL");
  if (typeof body.platform !== "string" || !PLATFORMS.has(body.platform)) {
    throw new ApiError("Choose a valid platform.", 422, "INVALID_PLATFORM");
  }
  if (typeof body.campaignType !== "string" || !CAMPAIGN_TYPES.has(body.campaignType)) {
    throw new ApiError("Choose a valid campaign type.", 422, "INVALID_CAMPAIGN_TYPE");
  }

  const profileUrl = text(body.profileUrl ?? "", "Profile URL", { max: 300 });
  if (profileUrl) {
    let parsed;
    try { parsed = new URL(profileUrl); } catch { throw new ApiError("Enter a valid profile or campaign URL.", 422, "INVALID_PROFILE_URL"); }
    if (!["http:", "https:"].includes(parsed.protocol)) throw new ApiError("Enter a valid profile or campaign URL.", 422, "INVALID_PROFILE_URL");
  }

  const phone = text(body.phone ?? "", "Phone number", { max: 32 });
  if (phone && !/^\+?[0-9\s().-]{7,32}$/.test(phone)) throw new ApiError("Enter a valid phone number.", 422, "INVALID_PHONE");
  return {
    name,
    email,
    organization: text(body.organization ?? "", "Organization", { max: 140 }),
    phone,
    platform: body.platform,
    campaignType: body.campaignType,
    campaignWindow: text(body.campaignWindow ?? "", "Campaign timing", { max: 120 }),
    budget: text(body.budget ?? "", "Budget", { max: 60 }),
    profileUrl,
    message: text(body.message, "Message", { min: 10, max: 3000 }),
  };
}
