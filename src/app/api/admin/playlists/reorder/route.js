import { ApiError, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { reorderPlaylists } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";

export async function PATCH(request) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlists-reorder", limit: 20 });
  if (access.response) return access.response;
  try {
    const body = await readJsonBody(request, 32 * 1024);
    if (Object.keys(body).length !== 1 || !Array.isArray(body.items)) throw new ApiError("Include an items list to reorder playlists.", 422, "INVALID_REORDER");
    await reorderPlaylists(body.items, access.session.email);
    revalidatePlaylistPages();
    return success({ reordered: body.items.length }, "Playlist order saved.");
  } catch (error) {
    return handleApiError(error);
  }
}
