"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, CircleAlert, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAdminBookings } from "@/lib/api/admin";

const statuses = ["pending", "reviewing", "confirmed", "rejected", "cancelled", "completed"];
const eventLabels = { concert: "Concert / live show", wedding: "Wedding", corporate: "Corporate event", private: "Private celebration", festival: "Festival", charity: "Charity event", other: "Other" };

function dateLabel(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminBookings({ page: targetPage, limit: 20, search, status });
      setRows(result.data);
      setPagination(result.pagination);
      setPage(targetPage);
    } catch (reason) {
      setRows([]);
      setError(reason.message || "Bookings are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void load(1); }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">Live performance requests</p><h1>Bookings</h1><p>Review event details, keep notes, and manage each request through its lifecycle.</p></div></div>
    <section className="admin-panel admin-bookings-panel" aria-label="Performance bookings">
      <div className="admin-list-toolbar"><label className="admin-search"><Search size={16} /><span className="sr-only">Search bookings</span><Input type="search" placeholder="Search name, email, venue…" value={searchInput} maxLength={100} onChange={(event) => setSearchInput(event.target.value)} /></label>
        <div className="admin-filter-row"><span className="sr-only" id="booking-status-filter-label">Filter bookings by status</span><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger aria-labelledby="booking-status-filter-label" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="admin-table-summary"><span>{loading ? "Loading booking requests…" : `${pagination.total} ${pagination.total === 1 ? "booking" : "bookings"}`}</span><span>Newest requests first</span></div>
      {error ? <div className="admin-table-state admin-table-state--error" role="alert"><CircleAlert size={20} /><strong>We couldn’t load bookings</strong><span>{error}</span><button type="button" className="admin-button admin-button--secondary" onClick={() => load(1)}>Try again</button></div> : loading ? <div className="admin-table-loading" aria-label="Loading bookings">{Array.from({ length: 5 }, (_, i) => <div key={i} />)}</div> : rows.length ? <DataTable><thead><tr><th>Requester</th><th>Event</th><th>Event date</th><th>Venue</th><th>Audience</th><th>Status</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><div className="admin-booking-requester"><Link href={`/admin/bookings/${encodeURIComponent(booking.id)}`}>{booking.fullName}<ArrowUpRight size={12} /></Link><small>{booking.email}</small></div></td><td>{eventLabels[booking.eventType] || booking.eventType}</td><td className="admin-date-cell">{dateLabel(booking.eventDate)}<small className="admin-booking-time">{booking.startTime}–{booking.endTime}</small></td><td>{booking.venue}<small className="admin-booking-time">{booking.city}, {booking.country}</small></td><td>{booking.expectedAudience.toLocaleString()}</td><td><span className={`admin-booking-status admin-booking-status--${booking.status}`}><i />{booking.status}</span></td><td><Link className="admin-icon-action" href={`/admin/bookings/${encodeURIComponent(booking.id)}`} aria-label={`View booking for ${booking.fullName}`}><ArrowUpRight size={16} /></Link></td></tr>)}</tbody></DataTable> : <div className="admin-table-state"><span className="admin-table-state__icon"><CalendarDays size={22} /></span><strong>{search || status !== "all" ? "No booking requests found" : "No booking requests yet"}</strong><span>{search || status !== "all" ? "Try a different search or status filter." : "New performance inquiries will appear here when they are submitted."}</span></div>}
      {!error && !loading && pagination.totalPages > 1 ? <div className="admin-pagination"><span>Page {page} of {pagination.totalPages}</span><div><button type="button" className="admin-pagination__button" disabled={page <= 1} onClick={() => load(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button><button type="button" className="admin-pagination__button" disabled={page >= pagination.totalPages} onClick={() => load(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button></div></div> : null}
    </section>
  </div>;
}
