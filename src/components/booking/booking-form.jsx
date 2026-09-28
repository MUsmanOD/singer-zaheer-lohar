"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api/client";

const eventTypes = [
  ["concert", "Concert / live show"], ["wedding", "Wedding"], ["corporate", "Corporate event"],
  ["private", "Private celebration"], ["festival", "Festival"], ["charity", "Charity event"], ["other", "Other"],
];

function BookingField({ id, label, required, children, hint }) {
  return <div className="form-field"><Label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</Label>{children}{hint ? <small className="booking-field-hint">{hint}</small> : null}</div>;
}

function localDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function BookingForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [eventType, setEventType] = useState("");

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!eventType) {
      setError("Choose an event type.");
      return;
    }
    const startTime = String(new FormData(form).get("startTime") || "");
    const endTimeInput = form.elements.namedItem("endTime");
    endTimeInput.setCustomValidity(endTimeInput.value && endTimeInput.value <= startTime ? "End time must be later than start time." : "");
    if (!form.reportValidity()) return;
    setBusy(true);
    setError("");
    const values = { ...Object.fromEntries(new FormData(form).entries()), eventType };
    try {
      await apiRequest("/api/bookings", { method: "POST", body: JSON.stringify(values) });
      setSubmitted(true);
      setEventType("");
      form.reset();
    } catch (reason) {
      setError(reason.message || "We couldn’t send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return <div className="booking-success" role="status" aria-live="polite"><span><CheckCircle2 size={22} /></span><p className="eyebrow">Request received</p><h2>Thank you for thinking of us.</h2><p>Your booking request is with our team. We’ll review the details and follow up using the contact information you provided.</p><button className="text-link" type="button" onClick={() => setSubmitted(false)}>Send another request</button></div>;
  }

  return (
    <form className="inquiry-form booking-form" onSubmit={submit}>
      <div className="booking-form__intro"><span className="booking-form__icon"><ShieldCheck size={18} /></span><div><strong>Performance details</strong><p>Share the essentials and our team will follow up about availability.</p></div></div>
      {error ? <div className="booking-form__error" role="alert">{error}</div> : null}
      <div className="form-grid">
        <BookingField id="booking-full-name" label="Full name" required><Input id="booking-full-name" name="fullName" autoComplete="name" minLength={2} maxLength={120} required placeholder="Your full name" /></BookingField>
        <BookingField id="booking-email" label="Email address" required><Input id="booking-email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" /></BookingField>
        <BookingField id="booking-phone" label="Phone number" required hint="Include your country code when possible."><Input id="booking-phone" name="phone" type="tel" autoComplete="tel" pattern="\+?[1-9][0-9\s().-]{6,30}" title="Enter a valid phone number with 7 to 15 digits." maxLength={32} required placeholder="+92 300 1234567" /></BookingField>
        <BookingField id="booking-event-type" label="Event type" required><Select value={eventType} onValueChange={setEventType}><SelectTrigger id="booking-event-type" className="form-select-trigger"><SelectValue placeholder="Select an event type" /></SelectTrigger><SelectContent>{eventTypes.map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></BookingField>
        <BookingField id="booking-date" label="Event date" required><Input id="booking-date" name="eventDate" type="date" min={localDate()} required /></BookingField>
        <div className="form-grid booking-time-grid"><BookingField id="booking-start-time" label="Start time" required><Input id="booking-start-time" name="startTime" type="time" required /></BookingField><BookingField id="booking-end-time" label="End time" required><Input id="booking-end-time" name="endTime" type="time" required onChange={(event) => event.currentTarget.setCustomValidity("")} /></BookingField></div>
        <BookingField id="booking-venue" label="Venue" required><Input id="booking-venue" name="venue" maxLength={180} required placeholder="Venue or event space" /></BookingField>
        <BookingField id="booking-city" label="City" required><Input id="booking-city" name="city" autoComplete="address-level2" maxLength={100} required placeholder="City" /></BookingField>
        <BookingField id="booking-country" label="Country" required><Input id="booking-country" name="country" autoComplete="country-name" maxLength={100} required placeholder="Country" /></BookingField>
        <BookingField id="booking-audience" label="Expected audience" required hint="Enter a whole number from 1 to 1,000,000."><Input id="booking-audience" name="expectedAudience" type="number" min="1" max="1000000" step="1" inputMode="numeric" required placeholder="e.g. 250" /></BookingField>
      </div>
      <BookingField id="booking-message" label="Additional message"><Textarea id="booking-message" name="message" maxLength={3000} rows={5} placeholder="Tell us about the schedule, production needs, or anything else we should know." /></BookingField>
      <div className="booking-honeypot" aria-hidden="true"><Label htmlFor="booking-website">Leave this field empty</Label><Input id="booking-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="form-submit booking-form__submit"><Button type="submit" className="button-dark" disabled={busy}>{busy ? <><LoaderCircle size={16} className="booking-spinner" /> Sending request…</> : <>Send booking request <ArrowRight size={16} /></>}</Button></div>
    </form>
  );
}
