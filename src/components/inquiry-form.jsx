"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const bookingEmail = "hello@zaheerlohar.com";

function Field({ id, label, children }) {
  return (
    <div className="form-field">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function InquiryForm({ type = "contact" }) {
  const isBooking = type === "booking";

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = isBooking ? "Performance booking inquiry" : "Contact from the website";
    const body = Array.from(formData.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    window.location.href = `mailto:${bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field id="name" label="Your name">
          <Input id="name" name="name" autoComplete="name" required placeholder="Name" />
        </Field>
        <Field id="email" label="Email address">
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </Field>
        {isBooking ? (
          <>
            <Field id="event-type" label="Event type">
              <select id="event-type" name="event type" className="form-select" defaultValue="" required>
                <option value="" disabled>Select an event</option>
                <option>Live show</option>
                <option>Private event</option>
                <option>Brand collaboration</option>
                <option>Other</option>
              </select>
            </Field>
            <Field id="event-date" label="Event date">
              <Input id="event-date" name="event date" type="date" />
            </Field>
            <Field id="event-location" label="Event location">
              <Input id="event-location" name="event location" placeholder="City, country" />
            </Field>
          </>
        ) : null}
      </div>
      <Field id="message" label={isBooking ? "Tell me about the event" : "Your message"}>
        <Textarea
          id="message"
          name="message"
          required
          placeholder={isBooking ? "Audience, schedule, and anything else I should know…" : "What would you like to talk about?"}
          rows={5}
        />
      </Field>
      <div className="form-submit">
        <Button type="submit" className="button-dark">{isBooking ? "Send booking inquiry" : "Send message"}</Button>
        <p>This opens a draft in your email app so you can review it before sending.</p>
      </div>
    </form>
  );
}
