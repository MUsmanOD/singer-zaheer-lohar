import { failure, handleApiError, paginationFromUrl, paginationMeta, successPaginated } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { listPlaylistVideos } from "@/lib/services/playlist-manager";

export async function GET(request, { params }) {
  const limited = await protectPublicApi(request, "playlist-videos");
  if (limited) return limited;
  try {
    const { slug } = await params;
    const { page, limit } = paginationFromUrl(new URL(request.url), 24, 100);
    const result = await listPlaylistVideos(slug, { page, limit });
    if (!result) return failure("This playlist could not be found.", "PLAYLIST_NOT_FOUND", 404);
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }), {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
