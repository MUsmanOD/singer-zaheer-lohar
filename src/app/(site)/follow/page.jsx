import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Headphones, Heart, Music2, Sparkles } from "lucide-react";
import { SocialChannels } from "@/components/social/social-channels";

export const metadata = {
  title: "Follow Along",
  description: "Find Zaheer Lohar’s official social profiles and music channels.",
};

export default function FollowPage() {
  return <main className="inner-page follow-page">
    <section className="follow-hero" aria-labelledby="follow-page-title">
      <div className="page-shell follow-hero__inner">
        <div className="follow-hero__copy">
          <p className="eyebrow"><span className="follow-hero__spark"><Heart size={13} /></span> Find your channel</p>
          <h1 id="follow-page-title">Keep the music close<span className="follow-hero__period">.</span></h1>
          <p className="follow-hero__description">Follow along for new releases, moments from the road, and the stories behind the songs.</p>
          <div className="follow-hero__meta"><span><Sparkles size={15} /> Official profiles</span><span className="follow-hero__separator" /><span>Updated by the team</span></div>
          <a className="follow-hero__jump" href="#follow-channels">Choose where we meet <ArrowDown size={15} aria-hidden="true" /></a>
        </div>
        <div className="follow-hero__visual" aria-hidden="true">
          <div className="follow-hero__orb"><span className="follow-hero__orb-ring" /><span className="follow-hero__orb-ring follow-hero__orb-ring--inner" /><span className="follow-hero__orb-core"><Headphones size={34} /></span><span className="follow-hero__orb-label">FOLLOW<br />THE MUSIC</span></div>
          <span className="follow-hero__float follow-hero__float--one"><Music2 size={16} /></span>
          <span className="follow-hero__float follow-hero__float--two"><Heart size={15} /></span>
          <span className="follow-hero__float follow-hero__float--three"><Sparkles size={14} /></span>
        </div>
      </div>
    </section>
    <section className="page-shell follow-section" aria-labelledby="follow-title">
      <div className="follow-section__heading"><span><Heart size={17} /></span><div><p className="eyebrow">The community</p><h2 id="follow-title">Choose where we meet.</h2><p>Official channels, all in one place. Audience counts are shown only when the team has added them.</p></div><span className="follow-section__count">Follow along</span></div>
      <div id="follow-channels"><SocialChannels /></div>
    </section>
    <section className="page-shell follow-page__closer" aria-labelledby="follow-closer-title">
      <div><p className="eyebrow"><Music2 size={13} /> Keep listening</p><h2 id="follow-closer-title">Find a new favorite.</h2><p>Move from the community into the songs, videos, and playlists that bring everyone back.</p></div>
      <div className="follow-page__closer-actions"><Link href="/music">Explore music <ArrowUpRight size={15} /></Link><Link href="/playlists">Browse playlists <ArrowRight size={15} /></Link></div>
    </section>
  </main>;
}
