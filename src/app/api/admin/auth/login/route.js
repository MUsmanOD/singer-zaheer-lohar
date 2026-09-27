import { createSessionToken, hasAdminConfiguration, ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS, safeCredentialMatch } from "@/lib/auth/session";
import { ApiError, ensureSameOrigin, failure, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectLoginAttempt } from "@/lib/api/security";
import { connectDb } from "@/lib/db/connection";
import { AdminUser } from "@/lib/db/models/AdminUser";
import { verifyPassword } from "@/lib/auth/password.mjs";

export async function POST(request) {
  try {
    ensureSameOrigin(request);
    const limited = await protectLoginAttempt(request);
    if (limited) return limited;
    if (!hasAdminConfiguration() || (!process.env.MONGODB_URI && (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD))) {
      return failure("Admin sign-in is not configured. Set MONGODB_URI, seed an admin user, and provide a 32-character SESSION_SECRET.", "AUTH_NOT_CONFIGURED", 503);
    }

    const body = await readJsonBody(request, 8 * 1024);
    if (Object.keys(body).some((key) => !["email", "password"].includes(key))) {
      throw new ApiError("Only email and password are accepted.", 400, "UNEXPECTED_FIELD");
    }
    if (typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 1024) {
      throw new ApiError("Enter a valid email and password.", 422, "INVALID_CREDENTIALS");
    }
    const email = body.email.trim().toLowerCase();
    let authenticatedEmail = null;
    let databaseAccountFound = false;
    if (process.env.MONGODB_URI) {
      await connectDb();
      const account = await AdminUser.findOne({ email }).select("+passwordHash");
      databaseAccountFound = Boolean(account);
      if (account?.isActive && verifyPassword(body.password, account.passwordHash)) {
        authenticatedEmail = account.email;
        account.lastLoginAt = new Date();
        await account.save();
      }
    }
    if (!authenticatedEmail && !databaseAccountFound && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const emailMatches = safeCredentialMatch(email, process.env.ADMIN_EMAIL.trim().toLowerCase());
      const passwordMatches = safeCredentialMatch(body.password, process.env.ADMIN_PASSWORD);
      if (emailMatches && passwordMatches) authenticatedEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    }
    if (!authenticatedEmail) return failure("That email and password do not match.", "INVALID_CREDENTIALS", 401);

    const token = createSessionToken(authenticatedEmail);
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const response = success({ email: authenticatedEmail }, "Signed in successfully.");
    response.headers.set("Set-Cookie", `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_SECONDS}${secure}`);
    response.headers.set("Cache-Control", "no-store, private");
    return response;
  } catch (error) {
    if (error instanceof ApiError) return failure(error.message, error.code, error.status);
    return handleApiError(error);
  }
}
