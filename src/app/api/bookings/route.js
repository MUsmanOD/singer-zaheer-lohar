import { handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { createBooking } from "@/lib/services/booking-manager";
import { validateBookingInput } from "@/lib/validators/booking";

export async function POST(request) {
  const limited = await protectPublicApi(request, "booking-create", { limit: 5, windowMs: 60 * 60_000, mutating: true });
  if (limited) return limited;
  try {
    const body = await readJsonBody(request, 16 * 1024);
    if (typeof body.website === "string" && body.website.trim()) {
      return success({ accepted: true }, "Your booking request has been received.", { status: 201 });
    }
    const input = validateBookingInput(body);
    const result = await createBooking(input);
    return success({ id: result.booking.id, status: result.booking.status }, "Your performance booking request has been received. Our team will be in touch.", { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
