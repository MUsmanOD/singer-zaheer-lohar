import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "zaheer_admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

export function hasAdminConfiguration() {
  return Boolean(
    process.env.SESSION_SECRET
      && process.env.SESSION_SECRET.length >= 32,
  );
}

function signature(value) {
  return createHmac("sha256", process.env.SESSION_SECRET || "")
    .update(value)
    .digest("base64url");
}

export function createSessionToken(email) {
  if (!hasAdminConfiguration()) throw new Error("Admin authentication is not configured.");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    email: email.toLowerCase(),
    issuedAt,
    expiresAt: issuedAt + ADMIN_SESSION_SECONDS,
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token) {
  if (!hasAdminConfiguration() || typeof token !== "string") return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expected = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const calculated = Buffer.from(expected);
  if (supplied.length !== calculated.length || !timingSafeEqual(supplied, calculated)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof session.email !== "string"
      || !session.email.includes("@")
      || !Number.isInteger(session.expiresAt)
      || session.expiresAt <= now
      || session.issuedAt > now + 60
      || session.expiresAt - session.issuedAt > ADMIN_SESSION_SECONDS
    ) return null;
    return { email: session.email, expiresAt: session.expiresAt };
  } catch {
    return null;
  }
}

export function readSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE_NAME}=`));
  if (!pair) return null;
  try {
    return verifySessionToken(decodeURIComponent(pair.slice(ADMIN_COOKIE_NAME.length + 1)));
  } catch {
    return null;
  }
}

export async function requireAdminPage() {
  const store = await cookies();
  const session = verifySessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
  if (!session) redirect("/admin/login");
  return session;
}

export function safeCredentialMatch(supplied, expected) {
  const suppliedHash = createHash("sha256").update(String(supplied ?? "")).digest();
  const expectedHash = createHash("sha256").update(String(expected ?? "")).digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}
