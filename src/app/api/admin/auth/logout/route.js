import { ADMIN_COOKIE_NAME } from "@/lib/auth/session";
import { ensureSameOrigin, failure } from "@/lib/api/response";

export async function POST(request) {
  try {
    ensureSameOrigin(request);
    return Response.json({ success: true, message: "Signed out.", data: null }, {
      headers: {
        "Set-Cookie": `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    return failure(error.message, error.code || "INVALID_ORIGIN", error.status || 403);
  }
}
