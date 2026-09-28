import { BookingForm } from "@/components/booking/booking-form";
import { PageIntro } from "@/components/page-intro";
import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Book Zaheer Lohar",
  description: "Book Zaheer Lohar for live concerts, private celebrations, cultural events, and brand performances.",
  path: "/booking",
  keywords: ["book Zaheer Lohar", "Zaheer Lohar live performance booking", "Pakistani singer for events", "Lahore folk singer booking"],
});

const eventTypes = ["Live shows", "Private celebrations", "Brand collaborations"];

export default function BookingPage() {
  return (
    <main className="inner-page">
      <PageIntro
        eyebrow="Booking inquiries"
        title="Let’s make your event feel like something."
        description="Tell us a little about the occasion and we’ll take it from there."
      />
      <section className="booking-page-layout page-shell">
        <aside className="booking-page__aside reveal">
          <p className="eyebrow">Available for</p>
          <div className="event-list">
            {eventTypes.map((type, index) => (
              <Card className="event-card" key={type}>
                <CardContent className="event-card__content">
                  <span className="event-card__number">0{index + 1}</span>
                  <span>{type}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="booking-page__note type-copy">Include the date, location, and the kind of performance you’re imagining. We’ll follow up to discuss availability and details.</p>
        </aside>
        <div className="booking-page__form reveal">
          <BookingForm />
        </div>
      </section>
    </main>
  );
}
