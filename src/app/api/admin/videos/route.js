import { handleApiError, paginationFromUrl, paginationMeta, readJsonBody, success, successPaginated } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { createManualVideo, createPlaylist, listAdminVideos } from "@/lib/services/playlist-manager";
import { revalidateHomeVideos, revalidatePlaylistPages } from "@/lib/services/revalidate";
import { validateVideoInput } from "@/lib/validators/video";
import { validatePlaylistInput } from "@/lib/validators/playlist";
import { parseMediaInput } from "@/lib/validators/media";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "videos-list" });
  if (access.response) return access.response;
  try {
    const url = new URL(request.url);
    const { page, limit } = paginationFromUrl(url, 20, 100);
    const search = url.searchParams.get("search") || "";
    if (search.length > 100) return Response.json({ success: false, message: "Search must be 100 characters or fewer.", error: "INVALID_SEARCH" }, { status: 400 });
    const status = url.searchParams.get("status") || "";
    const result = await listAdminVideos({ page, limit, search, playlistId: url.searchParams.get("playlistId") || "", status });
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  const access = await protectAdminApi(request, { mutating: true, name: "videos-create", limit: 5, windowMs: 15 * 60_000 });
  if (access.response) return access.response;
  try {
    const body = await readJsonBody(request);
    const { rawUrl, media } = parseMediaInput(body);
    if (media.type === "playlist") {
      const input = validatePlaylistInput({ playlistUrl: rawUrl, title: body.title, description: body.description, isFeatured: body.isFeatured ?? false, status: body.status ?? "active", displayOrder: body.displayOrder ?? 0 }, { allowUrl: true });
      const playlist = await createPlaylist(input, access.session.email);
      revalidateHomeVideos();
      revalidatePlaylistPages(playlist.slug);
      return success({ ...playlist, resourceType: "playlist" }, "YouTube detected a playlist link. The playlist and its videos were synchronized.", { status: 201 });
    }
    const input = validateVideoInput({ videoUrl: rawUrl, isFeatured: body.isFeatured ?? true, displayOrder: body.displayOrder ?? 0, status: body.status ?? "active" });
    const video = await createManualVideo(input, access.session.email);
    revalidateHomeVideos();
    return success({ ...video, resourceType: "video" }, "Video added to your library.", { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
