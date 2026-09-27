import { handleApiError, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { markAdminNotificationRead } from "@/lib/services/booking-manager";

export async function PATCH(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "notification-read", limit: 120 });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    return success(await markAdminNotificationRead(id), "Notification marked as read.");
  } catch (error) {
    return handleApiError(error);
  }
}
