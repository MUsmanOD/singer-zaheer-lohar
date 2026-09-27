import { ApiError, handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { getAdminBooking, updateAdminBooking } from "@/lib/services/booking-manager";

export async function GET(request, { params }) {
  const access = await protectAdminApi(request, { name: "booking-detail" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    return success(await getAdminBooking(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "booking-update", limit: 60 });
  if (access.response) return access.response;
  try {
    const body = await readJsonBody(request, 12 * 1024);
    const allowed = new Set(["status", "adminNotes"]);
    if (Object.keys(body).some((key) => !allowed.has(key))) throw new ApiError("The request contains an unsupported field.", 400, "UNEXPECTED_FIELD");
    const input = {};
    if (body.status !== undefined) input.status = body.status;
    if (body.adminNotes !== undefined) {
      if (typeof body.adminNotes !== "string" || body.adminNotes.length > 5000) throw new ApiError("Admin notes must be 5,000 characters or fewer.", 422, "INVALID_ADMIN_NOTES");
      input.adminNotes = body.adminNotes.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
    }
    const { id } = await params;
    const booking = await updateAdminBooking(id, input, access.session.email);
    return success(booking, "Booking updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
