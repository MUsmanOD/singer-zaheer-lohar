import { handleApiError, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { listFeaturedVideos } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const limited = await protectPublicApi(request, "featured-videos");
  if (limited) return limited;
  try {
    const data = await listFeaturedVideos({ limit: 6 });
    return success(data);
  } catch (error) {
    return handleApiError(error);
  }
}
