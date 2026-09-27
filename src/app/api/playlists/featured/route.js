import { handleApiError, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { listFeaturedPlaylists } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const limited = await protectPublicApi(request, "featured-playlists");
  if (limited) return limited;
  try {
    const data = await listFeaturedPlaylists();
    return success(data, undefined, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return handleApiError(error);
  }
}
