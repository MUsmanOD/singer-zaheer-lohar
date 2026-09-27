import { handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectPublicApi } from "@/lib/api/security";
import { recordSiteVisit } from "@/lib/services/visitor-manager";

export async function POST(request) {
  const limited = await protectPublicApi(request, "visitor-create", { limit: 240, windowMs: 60 * 1000, mutating: true });
  if (limited) return limited;
  try {
    const body = await readJsonBody(request, 2 * 1024);
    return success(await recordSiteVisit(request, body), undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
