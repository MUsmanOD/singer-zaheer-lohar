import Link from "next/link";
import { ArrowLeft, Disc3 } from "lucide-react";

export default function AdminNotFound() {
  return <div className="admin-table-state admin-not-found"><span className="admin-table-state__icon"><Disc3 size={20} /></span><strong>That dashboard page isn’t here</strong><span>The page may have moved or the playlist link may be out of date.</span><Link href="/admin/overview" className="admin-button admin-button--primary"><ArrowLeft size={14} /> Go to overview</Link></div>;
}
