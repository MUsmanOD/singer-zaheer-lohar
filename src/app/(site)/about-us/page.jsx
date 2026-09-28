import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Disc3, Music2 } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { AwardsSection } from "@/components/home/awards-section";

export const metadata = {
  title: "About Zaheer Lohar",
  description: "The official website of Zaheer Lohar, an international folk singer from Lahore, Pakistan. Discover Punjabi and Saraiki songs, videos, playlists, and performances.",
};

export default function AboutPage() {
  return <main className="inner-page about-page">
    <PageIntro eyebrow="Official artist site" title="Songs that stay with you." description="The official website of Zaheer Lohar, an international folk singer from Lahore, Pakistan. Discover Punjabi and Saraiki songs, videos, playlists, and live performances." />
    <section className="page-shell about-story" aria-labelledby="about-story-title">
      <div className="about-story__art"><div className="about-story__logo"><Image src="/images/logo/logo.png" alt="Zaheer Lohar" width={280} height={280} sizes="(max-width: 700px) 70vw, 280px" /></div><Music2 size={25} aria-hidden="true" /><Disc3 size={118} aria-hidden="true" /></div>
      <div className="about-story__copy"><p className="eyebrow">Singer · Songwriter · Performer</p><h2 id="about-story-title">Music for the moments we can’t quite put into words.</h2><p>Zaheer Lohar is an international folk singer from Lahore, Pakistan. His official music channel shares Punjabi and Saraiki songs, new releases, music videos, and performances. This is the official home for his music, playlists, and live updates.</p><div><Link href="/playlists">Explore playlists <ArrowUpRight size={15} /></Link><Link href="/booking">Book a performance <ArrowUpRight size={15} /></Link></div></div>
    </section>
    <AwardsSection />
  </main>;
}
