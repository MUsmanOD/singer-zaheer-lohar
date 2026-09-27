import { createHmac } from "node:crypto";
import { SiteVisit } from "@/lib/db/models/SiteVisit";

function cleanText(value, max) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function requestIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  return forwardedFor.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.headers.get("cf-connecting-ip")
    || "unknown";
}

function hashIp(ip) {
  const salt = process.env.VISITOR_SALT || process.env.SESSION_SECRET || process.env.MONGODB_URI || "site-visitor";
  return createHmac("sha256", salt).update(ip).digest("hex");
}

export async function recordSiteVisit(request, body = {}) {
  const url = new URL(request.url);
  const pathInput = cleanText(body.path, 240);
  const path = pathInput.startsWith("/") ? pathInput : "/";
  await SiteVisit.create({
    ipHash: hashIp(requestIp(request)),
    path,
    referrer: cleanText(body.referrer || request.headers.get("referer") || "", 500),
    userAgent: cleanText(request.headers.get("user-agent") || "", 500),
  });
  return { counted: true, origin: url.origin };
}
