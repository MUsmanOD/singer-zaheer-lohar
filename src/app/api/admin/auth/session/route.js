import { readSessionFromRequest } from "@/lib/auth/session";

export async function GET(request) {
  const session = readSessionFromRequest(request);
  return Response.json({
    success: true,
    data: { authenticated: Boolean(session), email: session?.email || null },
  }, { headers: { "Cache-Control": "no-store, private" } });
}
