import mongoose from "mongoose";
import { ApiError, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { setPlaylistFeatured } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";

export async function PATCH(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlist-featured" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
    const body = await readJsonBody(request, 8 * 1024);
    if (Object.keys(body).length !== 1 || typeof body.isFeatured !== "boolean") throw new ApiError("Featured must be true or false.", 422, "INVALID_FEATURED_STATE");
    const playlist = await setPlaylistFeatured(id, body.isFeatured, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success(playlist, body.isFeatured ? "Playlist featured." : "Playlist removed from featured.");
  } catch (error) {
    return handleApiError(error);
  }
}
