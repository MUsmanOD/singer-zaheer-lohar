import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false, noarchive: true } };

export default async function AdminLayout({ children }) {
  const session = await requireAdminPage();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
