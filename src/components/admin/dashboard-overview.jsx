"use client";

import Link from "next/link";
import Image from "next/image";
import { Activity, ArrowRight, ArrowUpRight, CalendarClock, Disc3, Eye, ListVideo, RefreshCw, Sparkles, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAdminDashboardStats } from "@/lib/api/admin";
import { useAdminToast } from "@/components/admin/admin-toast";
import { Skeleton } from "@/components/ui/skeleton";

const statisticCards = [
  { key: "totalPlaylists", label: "Total playlists", icon: Disc3, hint: "In your library" },
  { key: "activePlaylists", label: "Active playlists", icon: ListVideo, hint: "Visible on the website" },
  { key: "featuredPlaylists", label: "Featured", icon: Sparkles, hint: "Highlighted collections" },
  { key: "totalVideos", label: "Videos", icon: Activity, hint: "Synchronized from YouTube" },
  { key: "totalVisits", label: "Visitor views", icon: Eye, hint: "Every public page visit" },
  { key: "todayVisits", label: "Today", icon: CalendarClock, hint: "Visits since midnight" },
  { key: "uniqueVisitors", label: "Unique IPs", icon: Users, hint: "Based on hashed IPs" },
];

function formatNumber(value) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en").format(value);
}

function readableAction(action) {
  return ({
    "playlist.created": "Added a playlist",
    "playlist.updated": "Updated playlist details",
    "playlist.deleted": "Deleted a playlist",
    "playlist.refreshed": "Refreshed playlist videos",
    "playlist.featured": "Featured a playlist",
    "playlist.unfeatured": "Removed a playlist from featured",
    "playlist.status_changed": "Changed playlist visibility",
    "playlists.reordered": "Changed playlist order",
    "settings.updated": "Updated website settings",
  })[action] || "Updated the media library";
}

export function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useAdminToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminDashboardStats();
      setStats(result.data);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Your media workspace</p><h1>Overview</h1><p>A clear view of your playlists and the videos they hold.</p></div><button className="admin-button admin-button--secondary" type="button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? "is-spinning" : ""} /> Refresh</button></div>
      {error ? <div className="admin-inline-error" role="alert"><strong>Dashboard data is unavailable.</strong><span>{error}</span><button className="admin-button admin-button--secondary" type="button" onClick={load}>Try again</button></div> : null}
      <div className="admin-stat-grid">
        {statisticCards.map(({ key, label, icon: Icon, hint }) => <article className="admin-stat-card" key={key}><div className="admin-stat-card__top"><span>{label}</span><span className="admin-stat-card__icon"><Icon size={17} /></span></div><strong>{loading ? <Skeleton className="admin-stat-skeleton" /> : formatNumber(stats?.[key])}</strong><small>{hint}</small></article>)}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel admin-overview-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Recent additions</p><h2>Recently added</h2></div><Link href="/admin/playlists" className="admin-panel-link">All playlists <ArrowRight size={14} /></Link></div>
          {loading ? <div className="admin-list-skeletons">{[1, 2, 3].map((item) => <Skeleton className="admin-list-skeleton" key={item} />)}</div> : stats?.recentlyAdded?.length ? <div className="admin-recent-list">{stats.recentlyAdded.slice(0, 4).map((item) => <Link href={item.status === "active" ? `/playlists/${encodeURIComponent(item.slug)}` : "/admin/playlists"} target={item.status === "active" ? "_blank" : undefined} className="admin-recent-row" key={item.id}><span className="admin-recent-row__cover"><Image src={item.thumbnail || "/images/playlist-placeholder.svg"} alt="" fill sizes="47px" /></span><span className="admin-recent-row__copy"><strong>{item.title}</strong><small>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.createdAt))}</small></span><span className={`admin-status-pill admin-status-pill--${item.status}`}>{item.status}</span><ArrowUpRight className="admin-recent-row__arrow" size={15} /></Link>)}</div> : <div className="admin-empty-compact"><Disc3 size={22} /><strong>Your library is ready</strong><span>Add a YouTube playlist to get started.</span><Link className="admin-button admin-button--primary" href="/admin/playlists">Add playlist</Link></div>}
          {!loading && stats?.recentlyUpdated?.length ? <div className="admin-recently-updated"><div className="admin-recently-updated__heading"><strong>Recently updated</strong><span>Latest sync or edit</span></div>{stats.recentlyUpdated.slice(0, 3).map((item) => <Link className="admin-recently-updated__row" href="/admin/playlists" key={item.id}><span>{item.title}</span><small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(item.updatedAt))}</small></Link>)}</div> : null}
        </section>
        <section className="admin-panel admin-overview-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Latest changes</p><h2>Recent activity</h2></div><span className="admin-live-dot">Live data</span></div>
          {loading ? <div className="admin-list-skeletons">{[1, 2, 3, 4].map((item) => <Skeleton className="admin-list-skeleton" key={item} />)}</div> : stats?.activity?.length ? <div className="admin-activity-list">{stats.activity.map((item, index) => <div className="admin-activity-row" key={`${item.action}-${item.createdAt}-${index}`}><span className="admin-activity-row__dot" /><div><strong>{readableAction(item.action)}</strong><small>{item.title || item.resource} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt))}</small></div></div>)}</div> : <div className="admin-empty-compact admin-empty-compact--activity"><Activity size={22} /><strong>No activity yet</strong><span>Changes will appear here as you manage your library.</span></div>}
        </section>
        <section className="admin-panel admin-overview-panel admin-visitor-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Website traffic</p><h2>Visitor status</h2></div><span className="admin-live-dot">Counting views</span></div>
          {loading ? <div className="admin-list-skeletons">{[1, 2, 3].map((item) => <Skeleton className="admin-list-skeleton" key={item} />)}</div> : stats?.recentVisits?.length ? <div className="admin-activity-list">{stats.recentVisits.map((item) => <div className="admin-activity-row admin-visit-row" key={item.id}><span className="admin-activity-row__dot" /><div><strong>{item.path || "/"}</strong><small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt))}</small></div></div>)}</div> : <div className="admin-empty-compact admin-empty-compact--activity"><Eye size={22} /><strong>No visits recorded yet</strong><span>Public page visits will appear here after visitors browse the site.</span></div>}
        </section>
      </div>
      <section className="admin-quick-actions"><div><p className="admin-eyebrow">Make a move</p><h2>Keep the collection in tune.</h2></div><div className="admin-quick-actions__links"><Link href="/admin/playlists" className="admin-quick-action"><span><Disc3 size={18} /></span><strong>Manage playlists</strong><ArrowUpRight size={15} /></Link><Link href="/admin/settings" className="admin-quick-action"><span><Sparkles size={18} /></span><strong>Customize page</strong><ArrowUpRight size={15} /></Link></div></section>
    </div>
  );
}
