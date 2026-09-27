import mongoose from "mongoose";
import { ApiError, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { setPlaylistStatus } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";

export async function PATCH(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlist-status" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
    const body = await readJsonBody(request, 8 * 1024);
    if (Object.keys(body).length !== 1 || !["active", "inactive"].includes(body.status)) throw new ApiError("Choose active or inactive status.", 422, "INVALID_STATUS");
    const playlist = await setPlaylistStatus(id, body.status, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success(playlist, `Playlist ${body.status === "active" ? "activated" : "deactivated"}.`);
  } catch (error) {
    return handleApiError(error);
  }
}
