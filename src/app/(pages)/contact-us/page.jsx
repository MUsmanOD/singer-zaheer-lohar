import Link from "next/link";

import { InquiryForm } from "@/components/inquiry-form";
import { PageIntro } from "@/components/page-intro";

export const metadata = {
  title: "Contact",
  description: "Contact Zaheer Lohar for music, press, or collaboration inquiries.",
};

export default function ContactPage() {
  return (
    <main className="inner-page">
      <PageIntro
        eyebrow="Contact"
        title="Good things start with a conversation."
        description="For music, press, collaborations, or just to say hello — leave a note below."
      />
      <section className="inquiry-layout page-shell">
        <div className="inquiry-layout__aside reveal">
          <p className="eyebrow">Get in touch</p>
          <h2 className="type-heading">Tell me what’s<br />on your <em>mind.</em></h2>
          <p className="type-copy">Share a little about what you have in mind. Your email app will open with a draft for you to review before sending.</p>
          <p className="direct-email-label">Prefer email?</p>
          <Link className="direct-email" href="mailto:hello@zaheerlohar.com">hello@zaheerlohar.com</Link>
        </div>
        <div className="inquiry-layout__form reveal">
          <InquiryForm />
        </div>
      </section>
    </main>
  );
}
