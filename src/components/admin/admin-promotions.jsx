"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Megaphone, Search, CircleAlert } from "lucide-react";
import { getAdminPromotions } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

const STATUS_OPTIONS = ["new", "reviewing", "contacted", "closed"];
const PLATFORM_LABELS = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", spotify: "Spotify", facebook: "Facebook", x: "X", other: "Other" };
const CAMPAIGN_LABELS = { "music-release": "Music release", "brand-partnership": "Brand partnership", event: "Event promotion", content: "Social content", other: "Other" };

function dateLabel(value) {
  return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—";
}

function messagePreview(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 116 ? `${text.slice(0, 116).trimEnd()}…` : text;
}

export function AdminPromotions() {
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminPromotions({ page: requestedPage, limit: 20, search, status });
      setRows(result.data || []);
      setPagination(result.pagination || { total: 0, totalPages: 1 });
      setPage(requestedPage);
    } catch (reason) {
      setRows([]);
      setError(reason.message || "Promotion inquiries are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(1); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">Partnership requests</p><h1>Promotions</h1><p>Review campaign details, messages, and the people who want to work with Zaheer.</p></div></div>
    <section className="admin-panel admin-promotions-panel" aria-label="Promotion inquiries">
      <div className="admin-list-toolbar">
        <label className="admin-search"><Search size={16} /><span className="sr-only">Search promotion inquiries</span><Input type="search" placeholder="Search name, organization, message…" value={searchInput} maxLength={100} onChange={(event) => setSearchInput(event.target.value)} /></label>
        <div className="admin-filter-row"><span className="sr-only" id="promotion-status-filter-label">Filter promotion inquiries by status</span><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger aria-labelledby="promotion-status-filter-label" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="admin-table-summary"><span>{loading ? "Loading promotion inquiries…" : `${pagination.total} ${pagination.total === 1 ? "inquiry" : "inquiries"}`}</span><span>Newest first</span></div>
      {error ? <div className="admin-table-state admin-table-state--error" role="alert"><CircleAlert size={20} /><strong>We couldn’t load promotion inquiries</strong><span>{error}</span><button type="button" className="admin-button admin-button--secondary" onClick={() => load(1)}>Try again</button></div> : loading ? <div className="admin-table-loading" aria-label="Loading promotion inquiries">{Array.from({ length: 5 }, (_, index) => <div key={index} />)}</div> : rows.length ? <DataTable><thead><tr><th>Contact</th><th>Campaign</th><th>Platform</th><th>Message</th><th>Received</th><th>Status</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{rows.map((promotion) => <tr key={promotion.id}>
        <td><div className="admin-booking-requester"><Link href={`/admin/promotions/${encodeURIComponent(promotion.id)}`}>{promotion.name}<ArrowUpRight size={12} /></Link><small>{promotion.email}</small></div></td>
        <td>{promotion.organization || "Independent"}<small className="admin-booking-time">{CAMPAIGN_LABELS[promotion.campaignType] || promotion.campaignType}</small></td>
        <td>{PLATFORM_LABELS[promotion.platform] || promotion.platform}</td>
        <td className="admin-promotion-message" title={promotion.message}>{messagePreview(promotion.message)}</td>
        <td className="admin-date-cell">{dateLabel(promotion.createdAt)}</td>
        <td><span className={`admin-promotion-status admin-promotion-status--${promotion.status}`}><i />{promotion.status}</span></td>
        <td><Link className="admin-icon-action" href={`/admin/promotions/${encodeURIComponent(promotion.id)}`} aria-label={`View promotion inquiry from ${promotion.name}`}><ArrowUpRight size={16} /></Link></td>
      </tr>)}</tbody></DataTable> : <div className="admin-table-state"><span className="admin-table-state__icon"><Megaphone size={22} /></span><strong>{search || status !== "all" ? "No matching inquiries" : "No promotion inquiries yet"}</strong><span>{search || status !== "all" ? "Try a different search or status filter." : "New promotion requests from the public site will appear here."}</span></div>}
      {!error && !loading && pagination.totalPages > 1 ? <div className="admin-pagination"><span>Page {page} of {pagination.totalPages}</span><div><button type="button" className="admin-pagination__button" disabled={page <= 1} onClick={() => load(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button><button type="button" className="admin-pagination__button" disabled={page >= pagination.totalPages} onClick={() => load(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button></div></div> : null}
    </section>
  </div>;
}
