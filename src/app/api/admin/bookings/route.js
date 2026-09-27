import { handleApiError, paginationFromUrl, paginationMeta, success, successPaginated } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { listAdminBookings } from "@/lib/services/booking-manager";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "bookings-list" });
  if (access.response) return access.response;
  try {
    const url = new URL(request.url);
    const { page, limit } = paginationFromUrl(url, 20, 100);
    const search = url.searchParams.get("search") || "";
    if (search.length > 100) return Response.json({ success: false, message: "Search must be 100 characters or fewer.", error: "INVALID_SEARCH" }, { status: 400 });
    const result = await listAdminBookings({ page, limit, search, status: url.searchParams.get("status") || "" });
    return successPaginated(result.rows, paginationMeta({ page, limit, total: result.total }));
  } catch (error) {
    return handleApiError(error);
  }
}
