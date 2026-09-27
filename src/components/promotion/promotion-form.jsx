"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api/client";

const platforms = [["youtube", "YouTube"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["spotify", "Spotify"], ["facebook", "Facebook"], ["x", "X"], ["other", "Other"]];
const campaignTypes = [["music-release", "Music release"], ["brand-partnership", "Brand partnership"], ["event", "Event promotion"], ["content", "Social content"], ["other", "Other"]];
const budgets = [["under-500", "Under $500"], ["500-2000", "$500–$2,000"], ["2000-5000", "$2,000–$5,000"], ["5000-plus", "$5,000+"], ["discuss", "Let’s discuss"]];

function Field({ id, label, required = false, children, hint }) {
  return <div className="form-field"><Label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</Label>{children}{hint ? <small className="promotion-field-hint">{hint}</small> : null}</div>;
}

export function PromotionForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [platform, setPlatform] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [budget, setBudget] = useState("not-sure");

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!platform || !campaignType) {
      setError("Choose a platform and campaign type.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const values = {
        ...Object.fromEntries(new FormData(form).entries()),
        platform,
        campaignType,
        budget: budget === "not-sure" ? "" : budget,
      };
      await apiRequest("/api/promotions", { method: "POST", body: JSON.stringify(values) });
      form.reset();
      setPlatform("");
      setCampaignType("");
      setBudget("not-sure");
      setSubmitted(true);
    } catch (reason) {
      setError(reason.message || "We couldn’t send your inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <div className="booking-success promotion-success" role="status" aria-live="polite"><span><CheckCircle2 size={22} /></span><p className="eyebrow">Inquiry received</p><h2>Thanks for reaching out.</h2><p>Your promotion details are with our team. We’ll review the idea and follow up using the email you provided.</p><button className="text-link" type="button" onClick={() => setSubmitted(false)}>Send another inquiry</button></div>;

  return <form className="inquiry-form booking-form promotion-form" onSubmit={submit}>
    <div className="booking-form__intro"><span className="booking-form__icon"><ShieldCheck size={18} /></span><div><strong>Campaign details</strong><p>Tell us what you’re building and how the music can be part of it.</p></div></div>
    {error ? <div className="booking-form__error" role="alert">{error}</div> : null}
    <div className="form-grid">
      <Field id="promotion-name" label="Your name" required><Input id="promotion-name" name="name" autoComplete="name" minLength={2} maxLength={120} required placeholder="Full name" /></Field>
      <Field id="promotion-email" label="Email address" required><Input id="promotion-email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" /></Field>
      <Field id="promotion-organization" label="Brand or organization"><Input id="promotion-organization" name="organization" maxLength={140} placeholder="Company, label, or team" /></Field>
      <Field id="promotion-phone" label="Phone number"><Input id="promotion-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="Optional" /></Field>
      <Field id="promotion-platform" label="Platform" required><Select value={platform} onValueChange={setPlatform}><SelectTrigger id="promotion-platform" className="form-select-trigger"><SelectValue placeholder="Select a platform" /></SelectTrigger><SelectContent>{platforms.map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
      <Field id="promotion-type" label="Campaign type" required><Select value={campaignType} onValueChange={setCampaignType}><SelectTrigger id="promotion-type" className="form-select-trigger"><SelectValue placeholder="Select a campaign" /></SelectTrigger><SelectContent>{campaignTypes.map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
      <Field id="promotion-window" label="Campaign timing"><Input id="promotion-window" name="campaignWindow" maxLength={120} placeholder="Approximate dates or timeline" /></Field>
      <Field id="promotion-budget" label="Budget range"><Select value={budget} onValueChange={setBudget}><SelectTrigger id="promotion-budget" className="form-select-trigger"><SelectValue placeholder="Select a range" /></SelectTrigger><SelectContent><SelectItem value="not-sure">Not sure yet</SelectItem>{budgets.map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
    </div>
    <Field id="promotion-profile" label="Campaign or profile link"><Input id="promotion-profile" name="profileUrl" type="url" maxLength={300} placeholder="https://" /></Field>
    <Field id="promotion-message" label="Tell us about the promotion" required hint="Include goals, deliverables, audience, or any important context."><Textarea id="promotion-message" name="message" minLength={10} maxLength={3000} rows={6} required placeholder="What would you like to promote, and what would a successful partnership look like?" /></Field>
    <div className="booking-honeypot" aria-hidden="true"><Label htmlFor="promotion-website">Leave this field empty</Label><Input id="promotion-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <div className="form-submit booking-form__submit"><Button type="submit" className="button-dark" disabled={busy}>{busy ? <><LoaderCircle size={16} className="booking-spinner" /> Sending inquiry…</> : <>Send promotion inquiry <ArrowRight size={16} /></>}</Button><p>Your inquiry goes directly to the team and your details are only used to respond.</p></div>
  </form>;
}
