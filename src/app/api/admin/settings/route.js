import { getIntegrationStatus, getSettings, updateSettings } from "@/lib/services/playlist-manager";
import { protectAdminApi } from "@/lib/api/security";
import { handleApiError, readJsonBody, success } from "@/lib/api/response";
import { revalidatePlaylistPages } from "@/lib/services/revalidate";
import { revalidatePath } from "next/cache";

export async function GET(request) {
  const access = await protectAdminApi(request, { name: "settings-read" });
  if (access.response) return access.response;
  try {
    return success({ ...await getSettings(), integrations: getIntegrationStatus() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request) {
  const access = await protectAdminApi(request, { mutating: true, name: "settings-update" });
  if (access.response) return access.response;
  try {
    const settings = await updateSettings(await readJsonBody(request), access.session.email);
    revalidatePlaylistPages();
    revalidatePath("/api/playlists/settings");
    revalidatePath("/api/social-links");
    revalidatePath("/follow");
    return success({ ...settings, integrations: getIntegrationStatus() }, "Settings saved.");
  } catch (error) {
    return handleApiError(error);
  }
}
