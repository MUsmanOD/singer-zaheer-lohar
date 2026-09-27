import mongoose from "mongoose";
import { ApiError, failure, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { deleteVideo, getAdminVideo, updateVideo } from "@/lib/services/playlist-manager";
import { revalidateHomeVideos, revalidatePlaylistPages } from "@/lib/services/revalidate";
import { validateVideoUpdate } from "@/lib/validators/video";

function validateId(id) {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError("This video could not be found.", 404, "VIDEO_NOT_FOUND");
  }
}

export async function GET(request, { params }) {
  const access = await protectAdminApi(request, { name: "video-detail" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const video = await getAdminVideo(id);
    if (!video) return failure("This video could not be found.", "VIDEO_NOT_FOUND", 404);
    return success(video);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "video-update", limit: 30 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const input = validateVideoUpdate(await readJsonBody(request));
    const video = await updateVideo(id, input, access.session.email);
    revalidateHomeVideos();
    if (video.playlist?.slug) revalidatePlaylistPages(video.playlist.slug);
    return success(video, "Video updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "video-delete", limit: 10, windowMs: 60_000 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    validateId(id);
    const video = await getAdminVideo(id);
    if (!video) return failure("This video could not be found.", "VIDEO_NOT_FOUND", 404);
    await deleteVideo(id, access.session.email);
    revalidateHomeVideos();
    if (video.playlist?.slug) revalidatePlaylistPages(video.playlist.slug);
    return success({ id: video.id }, "Video deleted.");
  } catch (error) {
    return handleApiError(error);
  }
}
