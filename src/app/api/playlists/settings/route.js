import { handleApiError, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { getSettings } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const limited = await protectPublicApi(request, "playlist-settings");
  if (limited) return limited;
  try {
    const settings = await getSettings();
    return success({ title: settings.playlistPageTitle, description: settings.playlistPageDescription }, undefined, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
