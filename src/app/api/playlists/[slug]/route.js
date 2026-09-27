import { failure, handleApiError, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { getPublicPlaylist } from "@/lib/services/playlist-manager";

export async function GET(request, { params }) {
  const limited = await protectPublicApi(request, "playlist-detail");
  if (limited) return limited;
  try {
    const { slug } = await params;
    const playlist = await getPublicPlaylist(slug);
    if (!playlist) return failure("This playlist could not be found.", "PLAYLIST_NOT_FOUND", 404);
    return success({ ...playlist, videosEndpoint: `/api/playlists/${encodeURIComponent(slug)}/videos` }, undefined, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
