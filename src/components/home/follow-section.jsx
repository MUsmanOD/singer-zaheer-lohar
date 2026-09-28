import Link from "next/link";
import { ArrowDown, ArrowUpRight, Heart } from "lucide-react";
import { SocialChannels } from "@/components/social/social-channels";

export function HomeFollowSection() {
  return <section className="page-shell home-follow" aria-labelledby="home-follow-title">
    <div className="follow-section__heading">
      <span><Heart size={17} /></span>
      <div>
        <p className="eyebrow">The community</p>
        <h2 id="home-follow-title">Choose where we meet.</h2>
        <p>Follow the official channels for new music, moments from the road, and updates from the studio.</p>
      </div>
      <Link href="/follow" aria-label="See all social channels"><ArrowDown size={17} /></Link>
    </div>
    <SocialChannels autoScroll animateCounts />
    <Link className="home-follow__more" href="/follow">Explore all channels <ArrowUpRight size={14} /></Link>
  </section>;
}
