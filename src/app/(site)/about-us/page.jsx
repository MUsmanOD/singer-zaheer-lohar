import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Music2 } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { GallerySection } from "@/components/about/gallery-section";

export const metadata = {
  title: "About Zaheer Lohar",
  description: "The official website of Zaheer Lohar, an international folk singer from Lahore, Pakistan. Discover Punjabi and Saraiki songs, videos, playlists, and performances.",
};

const WAVE_BARS = [18, 30, 42, 26, 54, 34, 64, 44, 28, 50, 70, 38, 24, 48, 60, 32, 22, 40, 56, 30, 18];

export default function AboutPage() {
  return <main className="inner-page about-page">
    <PageIntro eyebrow="Official artist site" title="Songs that stay with you." description="The official website of Zaheer Lohar, an international folk singer from Lahore, Pakistan. Discover Punjabi and Saraiki songs, videos, playlists, and live performances." />
    <section id="about-story" className="page-shell about-story" aria-labelledby="about-story-title">
      <div className="about-story__art"><div className="about-story__logo"><Image src="/images/aboutimage.png" alt="Zaheer Lohar performing" width={280} height={420} sizes="(max-width: 700px) 70vw, 280px" /></div><Music2 className="about-story__note" size={25} aria-hidden="true" /><svg className="about-story__waveform" viewBox="0 0 240 80" role="img" aria-label="Animated music waveform">{WAVE_BARS.map((height, index) => <rect key={`${height}-${index}`} className="about-story__wavebar" x={index * 11 + 2} y={(80 - height) / 2} width="5" height={height} rx="2.5" style={{ "--wave-delay": `${index * 0.07}s` }} />)}</svg></div>
      <div className="about-story__copy"><p className="eyebrow">Singer · Songwriter · Performer</p><h2 id="about-story-title">Music for the moments we can’t quite put into words.</h2><p>Zaheer Lohar is an international folk singer from Lahore, Pakistan. His official music channel shares Punjabi and Saraiki songs, new releases, music videos, and performances. This is the official home for his music, playlists, and live updates.</p><div><Link href="/playlists">Explore playlists <ArrowUpRight size={15} /></Link><Link href="/booking">Book a performance <ArrowUpRight size={15} /></Link></div></div>
    </section>
    <GallerySection />
  </main>;
}
