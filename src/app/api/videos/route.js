import { handleApiError, paginationFromUrl, paginationMeta, successPaginated } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { listPublicVideos } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const limited = await protectPublicApi(request, "videos");
  if (limited) return limited;
  try {
    const url = new URL(request.url);
    const { page, limit } = paginationFromUrl(url, 24, 100);
    const search = url.searchParams.get("search") || "";
    if (search.length > 100) return Response.json({ success: false, message: "Search must be 100 characters or fewer.", error: "INVALID_SEARCH" }, { status: 400 });
    const result = await listPublicVideos({ page, limit, search });
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }));
  } catch (error) {
    return handleApiError(error);
  }
}
