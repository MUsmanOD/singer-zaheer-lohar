import { ArrowUpRight, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PromotionForm } from "@/components/promotion/promotion-form";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Promotion & Partnerships",
  description: "Start a music promotion, release campaign, brand partnership, or content collaboration with Zaheer Lohar’s team.",
  path: "/promotion",
  keywords: ["Zaheer Lohar promotion", "Pakistani music promotion", "music brand partnership", "artist collaboration"],
});

export default function PromotionPage() {
  return <main className="inner-page promotion-page">
    <PageIntro eyebrow="Campaigns & partnerships" title="Let’s make something worth sharing." description="From a new release to a thoughtful brand partnership, start with a few details about your idea." />
    <section className="page-shell inquiry-layout promotion-layout" aria-labelledby="promotion-intro-title">
      <div className="inquiry-layout__aside promotion-aside reveal">
        <span className="promotion-aside__mark"><Megaphone size={19} /></span>
        <p className="eyebrow">Good work starts with clarity</p>
        <h2 className="type-heading" id="promotion-intro-title">A thoughtful fit, from the <em>first note.</em></h2>
        <p className="type-copy">Tell us about the audience, timing, and outcome you have in mind. The team will review your brief and get back to you by email.</p>
        <div className="promotion-aside__points"><span><Sparkles size={15} /> Music and release campaigns</span><span><ShieldCheck size={15} /> Direct review by the team</span></div>
        <Link href="/playlists" className="promotion-aside__link">Get to know the music <ArrowUpRight size={14} /></Link>
      </div>
      <div className="inquiry-layout__form promotion-form-wrap reveal"><PromotionForm /></div>
    </section>
  </main>;
}
