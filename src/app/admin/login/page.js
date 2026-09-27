import { AdminLogin } from "@/components/admin/admin-login";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
