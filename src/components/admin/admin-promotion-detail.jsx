"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, CircleDollarSign, ExternalLink, LoaderCircle, Mail, Megaphone, Phone } from "lucide-react";
import { getAdminPromotion, updateAdminPromotion } from "@/lib/api/admin";
import { useAdminToast } from "@/components/admin/admin-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SOCIAL_CHANNEL_BY_KEY } from "@/lib/social-links";

const STATUS_OPTIONS = ["new", "reviewing", "contacted", "closed"];
const CAMPAIGN_LABELS = { "music-release": "Music release", "brand-partnership": "Brand partnership", event: "Event promotion", content: "Social content", other: "Other" };
const BUDGET_LABELS = { "under-500": "Under $500", "500-2000": "$500–$2,000", "2000-5000": "$2,000–$5,000", "5000-plus": "$5,000+", discuss: "Let’s discuss" };

function dateLabel(value) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value)) : "—";
}

export function AdminPromotionDetail({ id }) {
  const toast = useAdminToast();
  const [promotion, setPromotion] = useState(null);
  const [status, setStatus] = useState("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminPromotion(id).then((result) => {
      if (!active) return;
      setPromotion(result.data);
      setStatus(result.data.status);
      setAdminNotes(result.data.adminNotes || "");
    }).catch((reason) => { if (active) setError(reason.message || "This promotion inquiry could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updateAdminPromotion(id, { status, adminNotes });
      setPromotion(result.data);
      toast(result.message || "Promotion inquiry updated.");
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><div className="admin-booking-detail-skeleton" aria-label="Loading promotion details"><i /><i /><i /></div></div>;
  if (error || !promotion) return <div className="admin-page"><Link className="admin-back-link" href="/admin/promotions"><ArrowLeft size={14} /> Back to promotions</Link><div className="admin-inline-error" role="alert"><strong>Promotion inquiry unavailable</strong><span>{error || "This inquiry could not be found."}</span></div></div>;

  const platform = SOCIAL_CHANNEL_BY_KEY[promotion.platform]?.label || promotion.platform;
  return <div className="admin-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" href="/admin/promotions"><ArrowLeft size={14} /> All promotions</Link><p className="admin-eyebrow">Promotion inquiry</p><h1>{promotion.name}</h1><p>{promotion.organization || "Independent inquiry"} · Received {dateLabel(promotion.createdAt)}</p></div><span className={`admin-promotion-status admin-promotion-status--${promotion.status}`}><i />{promotion.status}</span></div>
    <div className="admin-booking-detail-layout">
      <section className="admin-panel admin-booking-detail-card" aria-labelledby="promotion-overview-heading"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Campaign overview</p><h2 id="promotion-overview-heading">{CAMPAIGN_LABELS[promotion.campaignType] || promotion.campaignType}</h2></div><Megaphone size={19} className="admin-panel-heading__icon" /></div>
        <div className="admin-booking-facts admin-promotion-facts"><div><Megaphone size={16} /><span><small>Platform</small><strong>{platform}</strong></span></div><div><CalendarDays size={16} /><span><small>Campaign timing</small><strong>{promotion.campaignWindow || "Not specified"}</strong></span></div><div><CircleDollarSign size={16} /><span><small>Budget</small><strong>{BUDGET_LABELS[promotion.budget] || promotion.budget || "Not specified"}</strong></span></div></div>
        <div className="admin-booking-contact"><p className="admin-eyebrow">Contact</p><a href={`mailto:${promotion.email}`}><Mail size={15} />{promotion.email}</a>{promotion.phone ? <a href={`tel:${promotion.phone}`}><Phone size={15} />{promotion.phone}</a> : null}{promotion.profileUrl ? <a href={promotion.profileUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />Campaign or profile link</a> : null}</div>
        <div className="admin-booking-message"><p className="admin-eyebrow">Campaign message</p><p>{promotion.message}</p></div>
      </section>
      <form className="admin-panel admin-booking-manage" onSubmit={save}><div className="admin-panel-heading"><div><p className="admin-eyebrow">Internal workflow</p><h2>Manage inquiry</h2></div></div>
        <div className="admin-form-field"><label id="promotion-detail-status-label">Inquiry status</label><Select value={status} onValueChange={setStatus}><SelectTrigger aria-labelledby="promotion-detail-status-label" className="admin-select-trigger admin-select-trigger--large"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div>
        <div className="admin-form-field"><label htmlFor="promotion-admin-notes">Admin notes</label><Textarea id="promotion-admin-notes" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength={5000} rows={8} placeholder="Add internal notes for the team…" /><small>Only visible in the admin dashboard.</small></div>
        <div className="admin-form-actions"><button className="admin-button admin-button--primary" type="submit" disabled={saving || adminNotes.length > 5000}>{saving ? <><LoaderCircle size={15} className="is-spinning" /> Saving…</> : <><Check size={15} /> Save changes</>}</button></div>
      </form>
    </div>
  </div>;
}
