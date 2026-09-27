import mongoose from "mongoose";
import { ApiError, handleApiError, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { refreshPlaylist } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";

export async function POST(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlist-refresh", limit: 8, windowMs: 60 * 60_000 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
      throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
    }
    const playlist = await refreshPlaylist(id, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success(playlist, "Playlist refreshed from YouTube.");
  } catch (error) {
    return handleApiError(error);
  }
}
