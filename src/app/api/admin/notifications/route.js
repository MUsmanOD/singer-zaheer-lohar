import { handleApiError, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { listAdminNotifications } from "@/lib/services/booking-manager";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "notifications-list", limit: 120 });
  if (access.response) return access.response;
  try {
    return success(await listAdminNotifications());
  } catch (error) {
    return handleApiError(error);
  }
}
