import { handleApiError, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { getSettings } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const limited = await protectPublicApi(request, "social-links", { limit: 60 });
  if (limited) return limited;
  try {
    const settings = await getSettings();
    return success(settings.socialLinks);
  } catch (error) {
    return handleApiError(error);
  }
}
