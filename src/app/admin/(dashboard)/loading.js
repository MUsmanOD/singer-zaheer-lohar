import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return <main className="admin-page admin-loading" aria-label="Loading dashboard"><div className="admin-page-heading"><div><Skeleton className="admin-loading-eyebrow" /><Skeleton className="admin-loading-title" /><Skeleton className="admin-loading-copy" /></div></div><div className="admin-stat-grid">{[1, 2, 3, 4].map((item) => <Skeleton className="admin-loading-stat" key={item} />)}</div><div className="admin-overview-grid">{[1, 2].map((item) => <Skeleton className="admin-loading-panel" key={item} />)}</div></main>;
}
