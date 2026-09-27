import { AdminBookingDetail } from "@/components/admin/admin-booking-detail";

export default async function AdminBookingPage({ params }) {
  const { id } = await params;
  return <AdminBookingDetail id={id} />;
}
