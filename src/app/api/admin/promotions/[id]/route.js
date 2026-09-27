import { handleApiError, readJsonBody, success } from "@/lib/api/response";
import { protectAdminApi } from "@/lib/api/security";
import { getAdminPromotion, updateAdminPromotion } from "@/lib/services/promotion-manager";

export async function GET(request, { params }) {
  const access = await protectAdminApi(request, { name: "promotion-detail" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    return success(await getAdminPromotion(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  const access = await protectAdminApi(request, { mutating: true, name: "promotion-update" });
  if (access.response) return access.response;
  try {
    const { id } = await params;
    return success(await updateAdminPromotion(id, await readJsonBody(request, 8 * 1024), access.session.email), "Promotion inquiry updated.");
  } catch (error) {
    return handleApiError(error);
  }
}
