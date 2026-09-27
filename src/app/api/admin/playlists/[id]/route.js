import mongoose from "mongoose";
import { ApiError, failure, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { deletePlaylist, getAdminPlaylist, updatePlaylist } from "@/lib/services/playlist-manager";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";
import { validatePlaylistInput } from "@/lib/validators/playlist";

function validateId(id) {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError("This playlist could not be found.", 404, "PLAYLIST_NOT_FOUND");
  }
}

export async function GET(request, { params }) {
  const access = await protectAdminApi(request, { name: "playlist-detail" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const playlist = await getAdminPlaylist(id);
    if (!playlist) return failure("This playlist could not be found.", "PLAYLIST_NOT_FOUND", 404);
    return success(playlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlist-update", limit: 30 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const input = validatePlaylistInput(await readJsonBody(request), { partial: true });
    const playlist = await updatePlaylist(id, input, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success(playlist, "Playlist updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "playlist-delete", limit: 10, windowMs: 60_000 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const playlist = await getAdminPlaylist(id);
    if (!playlist) return failure("This playlist could not be found.", "PLAYLIST_NOT_FOUND", 404);
    await deletePlaylist(id, access.session.email);
    revalidatePlaylistPages(playlist.slug);
    return success({ id: playlist.id }, "Playlist deleted.");
  } catch (error) {
    return handleApiError(error);
  }
}
