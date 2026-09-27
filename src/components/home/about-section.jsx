import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Music2 } from "lucide-react";

export function AboutSection() {
  return <section className="home-about" aria-labelledby="home-about-title"><div className="page-shell home-about__layout">
    <div className="home-about__mark"><Image src="/images/logo/logo.png" alt="" width={160} height={160} sizes="(max-width: 700px) 88px, 142px" /><Music2 size={21} aria-hidden="true" /></div>
    <div className="home-about__copy"><p className="eyebrow">A little about the artist</p><h2 id="home-about-title">Music made to feel close.</h2><p>Zaheer Lohar is a singer, songwriter, and performer. This is a place to discover the songs, live moments, and stories that bring the music to life.</p><Link href="/about-us">More about Zaheer <ArrowUpRight size={15} /></Link></div>
    <span className="home-about__index">01 — ABOUT</span>
  </div></section>;
}
