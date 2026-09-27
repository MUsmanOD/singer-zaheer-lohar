import { createHmac } from "node:crypto";
import { connectDb } from "@/lib/db/connection";
import { readSessionFromRequest } from "@/lib/auth/session";
import { ApiError, failure } from "@/lib/api/response";

const RATE_WINDOW_MS = 60 * 1000;
let rateLimitIndexPromise;

function clientKey(request, name) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const address = forwardedFor.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || process.env.SESSION_SECRET || process.env.MONGODB_URI || "playlist-api";
  return createHmac("sha256", salt).update(`${name}:${address}`).digest("hex");
}

async function takeRateLimit(request, { name, limit, windowMs = RATE_WINDOW_MS }) {
  const connection = await connectDb();
  const collection = connection.db.collection("api_rate_limits");
  rateLimitIndexPromise ||= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((error) => {
    rateLimitIndexPromise = null;
    throw error;
  });
  await rateLimitIndexPromise;

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${clientKey(request, name)}:${windowStart}`;
  let record;
  try {
    record = await collection.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs * 2) } },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;
    record = await collection.findOneAndUpdate({ _id: key }, { $inc: { count: 1 } }, { returnDocument: "after" });
  }
  const count = record?.value?.count ?? record?.count ?? limit + 1;
  const resetSeconds = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
  const headers = new Headers({
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit - count)),
    "X-RateLimit-Reset": String(Math.ceil((windowStart + windowMs) / 1000)),
  });
  if (count > limit) {
    headers.set("Retry-After", String(resetSeconds));
    return failure("Too many requests. Please try again shortly.", "RATE_LIMITED", 429, headers);
  }
  return null;
}

export async function protectPublicApi(request, routeName, { limit = 120, windowMs = RATE_WINDOW_MS, mutating = false } = {}) {
  try {
    if (mutating) {
      const origin = request.headers.get("origin");
      if (!origin || origin !== new URL(request.url).origin) {
        throw new ApiError("This request could not be verified. Reload the page and try again.", 403, "INVALID_ORIGIN");
      }
    }
    return await takeRateLimit(request, { name: `public:${routeName}`, limit, windowMs });
  } catch (error) {
    if (error instanceof ApiError) return failure(error.message, error.code, error.status);
    if (error?.code === "DATABASE_NOT_CONFIGURED") {
      return failure("Application storage is not configured yet.", "DATABASE_NOT_CONFIGURED", 503);
    }
    return failure("Playlist data is temporarily unavailable.", "SERVICE_UNAVAILABLE", 503);
  }
}

export async function protectAdminApi(request, { mutating = false, name = "admin", limit = 60, windowMs = 60_000 } = {}) {
  try {
    if (mutating) {
      const origin = request.headers.get("origin");
      if (!origin || origin !== new URL(request.url).origin) {
        throw new ApiError("This request could not be verified. Reload the page and try again.", 403, "INVALID_ORIGIN");
      }
    }
    const session = readSessionFromRequest(request);
    if (!session) return { response: failure("Sign in to continue.", "UNAUTHORIZED", 401) };
    const limited = await takeRateLimit(request, { name: `admin:${name}:${session.email}`, limit, windowMs });
    if (limited) return { response: limited };
    return { session };
  } catch (error) {
    if (error instanceof ApiError) return { response: failure(error.message, error.code, error.status) };
    if (error?.code === "DATABASE_NOT_CONFIGURED") {
      return { response: failure("Application storage is not configured yet.", "DATABASE_NOT_CONFIGURED", 503) };
    }
    return { response: failure("The service is temporarily unavailable.", "SERVICE_UNAVAILABLE", 503) };
  }
}

export async function protectLoginAttempt(request) {
  try {
    return await takeRateLimit(request, { name: "admin:login", limit: 8, windowMs: 15 * 60_000 });
  } catch (error) {
    if (error?.code === "DATABASE_NOT_CONFIGURED") return failure("Application storage is not configured yet.", "DATABASE_NOT_CONFIGURED", 503);
    return failure("The login service is temporarily unavailable.", "SERVICE_UNAVAILABLE", 503);
  }
}
