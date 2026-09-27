import { handleApiError, paginationFromUrl, paginationMeta, successPaginated } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { listPublicPlaylists, getSettings } from "@/lib/services/playlist-manager";

const publicHeaders = { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" };

export async function GET(request) {
  const limited = await protectPublicApi(request, "playlists");
  if (limited) return limited;
  try {
    const url = new URL(request.url);
    const settings = await getSettings();
    const { page, limit } = paginationFromUrl(url, settings.defaultPlaylistLimit || 12, 48);
    const search = url.searchParams.get("search") || "";
    const featuredValue = url.searchParams.get("featured") || "false";
    if (search.length > 100) return Response.json({ success: false, message: "Search must be 100 characters or fewer.", error: "INVALID_SEARCH" }, { status: 400 });
    if (!["true", "false"].includes(featuredValue)) return Response.json({ success: false, message: "Choose a valid featured filter.", error: "INVALID_FILTER" }, { status: 400 });
    const result = await listPublicPlaylists({ page, limit, search, featured: featuredValue === "true" });
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }), { headers: publicHeaders });
  } catch (error) {
    return handleApiError(error);
  }
}
