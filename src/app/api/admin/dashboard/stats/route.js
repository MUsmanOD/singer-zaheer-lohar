import { handleApiError, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { getDashboardStats } from "@/lib/services/playlist-manager";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "dashboard-stats" });
  if (access.response) return access.response;
  try {
    return success(await getDashboardStats());
  } catch (error) {
    return handleApiError(error);
  }
}
