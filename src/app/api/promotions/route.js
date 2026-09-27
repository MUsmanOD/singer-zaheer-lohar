import { handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { createPromotion } from "@/lib/services/promotion-manager";
import { validatePromotionInput } from "@/lib/validators/promotion";

export async function POST(request) {
  const limited = await protectPublicApi(request, "promotion-create", { limit: 5, windowMs: 60 * 60_000, mutating: true });
  if (limited) return limited;
  try {
    const body = await readJsonBody(request, 16 * 1024);
    if (typeof body.website === "string" && body.website.trim()) {
      return success({ accepted: true }, "Your promotion inquiry has been received.", { status: 201 });
    }
    const input = validatePromotionInput(body);
    const result = await createPromotion(input);
    return success({ id: result.id, status: result.status }, "Your promotion inquiry has been received. Our team will be in touch.", { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
