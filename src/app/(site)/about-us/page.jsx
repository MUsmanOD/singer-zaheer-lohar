import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Disc3, Music2 } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { AwardsSection } from "@/components/home/awards-section";

export const metadata = {
  title: "About Zaheer Lohar",
  description: "Discover the music, performances, and work of singer and songwriter Zaheer Lohar.",
};

export default function AboutPage() {
  return <main className="inner-page about-page">
    <PageIntro eyebrow="About the artist" title="Songs that stay with you." description="A voice, a story, and the feeling that keeps bringing us back to the music." />
    <section className="page-shell about-story" aria-labelledby="about-story-title">
      <div className="about-story__art"><div className="about-story__logo"><Image src="/images/logo/logo.png" alt="" width={280} height={280} sizes="(max-width: 700px) 70vw, 280px" /></div><Music2 size={25} aria-hidden="true" /><Disc3 size={118} aria-hidden="true" /></div>
      <div className="about-story__copy"><p className="eyebrow">Singer · Songwriter · Performer</p><h2 id="about-story-title">Music for the moments we can’t quite put into words.</h2><p>Zaheer Lohar’s work brings songs and live performances together in one place. Explore the latest music, revisit a favorite playlist, or get in touch about bringing a performance to your event.</p><div><Link href="/playlists">Explore playlists <ArrowUpRight size={15} /></Link><Link href="/booking">Book a performance <ArrowUpRight size={15} /></Link></div></div>
    </section>
    <AwardsSection />
  </main>;
}
