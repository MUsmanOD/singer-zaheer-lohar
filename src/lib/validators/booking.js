import { ApiError } from "@/lib/api/response";

const BOOKING_FIELDS = new Set([
  "fullName", "email", "phone", "eventType", "eventDate", "startTime", "endTime",
  "venue", "city", "country", "expectedAudience", "message", "website",
]);
const EVENT_TYPES = new Set(["concert", "wedding", "corporate", "private", "festival", "charity", "other"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function requiredText(value, label, { max = 160, min = 1 } = {}) {
  if (typeof value !== "string") throw new ApiError(`${label} is required.`, 422, "INVALID_BOOKING_FIELD");
  const text = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ");
  if (text.length < min) throw new ApiError(`${label} must be at least ${min} characters.`, 422, "INVALID_BOOKING_FIELD");
  if (text.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`, 422, "INVALID_BOOKING_FIELD");
  return text;
}

export function validateBookingInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Enter your event details to send a booking request.", 422, "INVALID_BOOKING");
  }
  const unexpected = Object.keys(body).find((key) => !BOOKING_FIELDS.has(key));
  if (unexpected) throw new ApiError("The request contains an unsupported field.", 400, "UNEXPECTED_FIELD");
  if (body.website !== undefined && typeof body.website !== "string") {
    throw new ApiError("The request could not be verified.", 422, "INVALID_BOOKING");
  }

  const fullName = requiredText(body.fullName, "Full name", { min: 2, max: 120 });
  if (/[<>]/.test(fullName) || !/[\p{L}\p{N}]/u.test(fullName)) throw new ApiError("Enter a valid full name.", 422, "INVALID_NAME");

  const email = requiredText(body.email, "Email", { max: 254 }).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ApiError("Enter a valid email address.", 422, "INVALID_EMAIL");

  const phoneInput = requiredText(body.phone, "Phone number", { max: 32 });
  const phone = phoneInput.replace(/[\s().-]/g, "");
  if (!/^\+?[1-9]\d{6,14}$/.test(phone)) {
    throw new ApiError("Enter a valid phone number with 7 to 15 digits, including country code when available.", 422, "INVALID_PHONE");
  }

  if (typeof body.eventType !== "string" || !EVENT_TYPES.has(body.eventType)) {
    throw new ApiError("Choose a valid event type.", 422, "INVALID_EVENT_TYPE");
  }

  if (typeof body.eventDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.eventDate)) {
    throw new ApiError("Choose a valid event date.", 422, "INVALID_EVENT_DATE");
  }
  const [year, month, day] = body.eventDate.split("-").map(Number);
  const eventDate = new Date(Date.UTC(year, month - 1, day));
  if (eventDate.getUTCFullYear() !== year || eventDate.getUTCMonth() !== month - 1 || eventDate.getUTCDate() !== day) {
    throw new ApiError("Choose a real calendar date.", 422, "INVALID_EVENT_DATE");
  }
  if (body.eventDate < new Date().toISOString().slice(0, 10)) {
    throw new ApiError("Event date must be today or later.", 422, "PAST_EVENT_DATE");
  }

  if (typeof body.startTime !== "string" || !TIME_PATTERN.test(body.startTime)
    || typeof body.endTime !== "string" || !TIME_PATTERN.test(body.endTime)) {
    throw new ApiError("Enter a valid start and end time using 24-hour time.", 422, "INVALID_EVENT_TIME");
  }
  if (body.endTime <= body.startTime) throw new ApiError("End time must be later than start time.", 422, "INVALID_EVENT_TIME_RANGE");

  const venue = requiredText(body.venue, "Venue", { max: 180 });
  const city = requiredText(body.city, "City", { max: 100 });
  const country = requiredText(body.country, "Country", { max: 100 });

  const audienceInput = typeof body.expectedAudience === "number" ? String(body.expectedAudience) : body.expectedAudience;
  if (typeof audienceInput !== "string" || !/^\d{1,7}$/.test(audienceInput)) {
    throw new ApiError("Expected audience must be a whole number from 1 to 1,000,000.", 422, "INVALID_AUDIENCE");
  }
  const expectedAudience = Number(audienceInput);
  if (expectedAudience < 1 || expectedAudience > 1000000) {
    throw new ApiError("Expected audience must be a whole number from 1 to 1,000,000.", 422, "INVALID_AUDIENCE");
  }

  const message = body.message === undefined ? "" : requiredText(body.message, "Message", { max: 3000, min: 0 });
  return { fullName, email, phone, eventType: body.eventType, eventDate, eventDateLabel: body.eventDate, startTime: body.startTime, endTime: body.endTime, venue, city, country, expectedAudience, message };
}
