"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, LoaderCircle, Mail, MapPin, Phone, Users } from "lucide-react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { getAdminBooking, updateAdminBooking } from "@/lib/api/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statuses = ["pending", "reviewing", "confirmed", "rejected", "cancelled", "completed"];
const eventLabels = { concert: "Concert / live show", wedding: "Wedding", corporate: "Corporate event", private: "Private celebration", festival: "Festival", charity: "Charity event", other: "Other" };

function dateLabel(value) {
  return value ? new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";
}

export function AdminBookingDetail({ id }) {
  const toast = useAdminToast();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminBooking(id).then((result) => {
      if (!active) return;
      setBooking(result.data);
      setStatus(result.data.status);
      setAdminNotes(result.data.adminNotes || "");
    }).catch((reason) => { if (active) setError(reason.message || "This booking could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateAdminBooking(id, { status, adminNotes });
      setBooking(response.data);
      toast(response.message || "Booking updated.");
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><div className="admin-booking-detail-skeleton" aria-label="Loading booking details"><i /><i /><i /></div></div>;
  if (error || !booking) return <div className="admin-page"><Link className="admin-back-link" href="/admin/bookings"><ArrowLeft size={14} /> Back to bookings</Link><div className="admin-inline-error" role="alert"><strong>Booking unavailable</strong><span>{error || "This booking could not be found."}</span></div></div>;

  return <div className="admin-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" href="/admin/bookings"><ArrowLeft size={14} /> All bookings</Link><p className="admin-eyebrow">Performance inquiry</p><h1>{booking.fullName}</h1><p>{eventLabels[booking.eventType] || booking.eventType} · Submitted {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(booking.createdAt))}</p></div><span className={`admin-booking-status admin-booking-status--${booking.status}`}><i />{booking.status}</span></div>
    <div className="admin-booking-detail-layout">
      <section className="admin-panel admin-booking-detail-card" aria-labelledby="booking-event-heading"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Event overview</p><h2 id="booking-event-heading">{eventLabels[booking.eventType] || booking.eventType}</h2></div><CalendarDays size={19} className="admin-panel-heading__icon" /></div>
        <div className="admin-booking-facts"><div><CalendarDays size={16} /><span><small>Event date &amp; time</small><strong>{dateLabel(booking.eventDate)} · {booking.startTime}–{booking.endTime}</strong></span></div><div><MapPin size={16} /><span><small>Venue</small><strong>{booking.venue}<br />{booking.city}, {booking.country}</strong></span></div><div><Users size={16} /><span><small>Expected audience</small><strong>{booking.expectedAudience.toLocaleString()} people</strong></span></div></div>
        <div className="admin-booking-contact"><p className="admin-eyebrow">Contact</p><a href={`mailto:${booking.email}`}><Mail size={15} />{booking.email}</a><a href={`tel:${booking.phone}`}><Phone size={15} />{booking.phone}</a></div>
        {booking.message ? <div className="admin-booking-message"><p className="admin-eyebrow">Additional message</p><p>{booking.message}</p></div> : null}
      </section>
      <form className="admin-panel admin-booking-manage" onSubmit={save}><div className="admin-panel-heading"><div><p className="admin-eyebrow">Internal workflow</p><h2>Manage request</h2></div></div>
        <div className="admin-form-field"><label id="booking-detail-status-label">Booking status</label><Select value={status} onValueChange={setStatus}><SelectTrigger aria-labelledby="booking-detail-status-label" className="admin-select-trigger admin-select-trigger--large"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
        <div className="admin-form-field"><label htmlFor="booking-admin-notes">Admin notes</label><Textarea id="booking-admin-notes" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength={5000} rows={8} placeholder="Add internal notes for the team…" /><small>Only visible in the admin dashboard.</small></div>
        <div className="admin-form-actions"><button className="admin-button admin-button--primary" type="submit" disabled={saving || adminNotes.length > 5000}>{saving ? <><LoaderCircle size={15} className="is-spinning" /> Saving…</> : <><Check size={15} /> Save changes</>}</button></div>
      </form>
    </div>
  </div>;
}
