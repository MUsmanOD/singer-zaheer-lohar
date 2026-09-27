import { handleApiError, paginationFromUrl, paginationMeta, readJsonBody, success, successPaginated } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { createManualVideo, createPlaylist, listAdminPlaylists } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";
import { validatePlaylistInput } from "@/lib/validators/playlist";
import { validateVideoInput } from "@/lib/validators/video";
import { parseMediaInput } from "@/lib/validators/media";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "playlists-list" });
  if (access.response) return access.response;
  try {
    const url = new URL(request.url);
    const { page, limit } = paginationFromUrl(url, 20, 100);
    const result = await listAdminPlaylists({
      page,
      limit,
      search: url.searchParams.get("search") || "",
      status: url.searchParams.get("status") || "",
      featured: url.searchParams.get("featured") || "",
      platform: url.searchParams.get("platform") || "",
      sort: url.searchParams.get("sort") || "newest",
    });
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlists-create", limit: 5, windowMs: 15 * 60_000 });
  if (access.response) return access.response;
  try {
    const body = await readJsonBody(request);
    const { rawUrl, media } = parseMediaInput(body);
    if (media.type === "video") {
      const input = validateVideoInput({ videoUrl: rawUrl, isFeatured: body.isFeatured ?? false, displayOrder: body.displayOrder ?? 0 });
      const video = await createManualVideo(input, access.session.email);
      revalidatePlaylistPages();
      return success({ ...video, resourceType: "video" }, "YouTube detected a video link. The video was added to your library.", { status: 201 });
    }
    const input = validatePlaylistInput({ ...body, playlistUrl: rawUrl }, { allowUrl: true });
    const playlist = await createPlaylist(input, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success({ ...playlist, resourceType: "playlist" }, "Playlist added and synchronized.", { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
