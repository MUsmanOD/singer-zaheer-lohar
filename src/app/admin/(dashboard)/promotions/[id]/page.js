import { AdminPromotionDetail } from "@/components/admin/admin-promotion-detail";

export default async function AdminPromotionPage({ params }) {
  const { id } = await params;
  return <AdminPromotionDetail id={id} />;
}
