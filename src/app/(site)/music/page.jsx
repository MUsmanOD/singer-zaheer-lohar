import { ArrowDown, ArrowRight, ArrowUpRight, Disc3, Music2 } from "lucide-react";
import { connectDb } from "@/lib/db/connection";
import { getRandomPublicVideo } from "@/lib/services/playlist-manager";
import { MusicLibrary } from "@/components/music/music-library";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "Zaheer Lohar Music",
  description: "Listen to Zaheer Lohar’s latest Punjabi and Saraiki songs, official music videos, and releases from his music catalogue.",
  path: "/music",
  keywords: ["Zaheer Lohar songs", "Zaheer Lohar music videos", "latest Punjabi songs", "Saraiki folk songs", "Pakistani folk music"],
  imageAlt: "Zaheer Lohar music catalogue",
});

export const dynamic = "force-dynamic";

async function getHeroSong() {
  try {
    await connectDb();
    return await getRandomPublicVideo();
  } catch {
    return null;
  }
}

function MusicHeroArt() {
  return <div className="music-hero-art" aria-hidden="true"><div className="music-hero-art__disc"><span /></div><span className="music-hero-art__label">ZAHEER<br />LOHAR</span><span className="music-hero-art__note music-hero-art__note--one">♪</span><span className="music-hero-art__note music-hero-art__note--two">♫</span></div>;
}

export default async function MusicPage() {
  const heroSong = await getHeroSong();

  return <main className="inner-page music-page">
    <section className="music-hero" aria-labelledby="music-title">
      <div className="page-shell music-hero__inner">
        <div className="music-hero__copy">
          <p className="eyebrow"><span className="music-hero__spark"><Disc3 size={13} /></span> The catalogue, in motion</p>
          <h1 id="music-title">Music that stays with you<span className="music-hero__period">.</span></h1>
          <p className="music-hero__description">Discover songs, videos, and the stories behind them in one carefully curated library.</p>
          <div className="music-hero__meta"><span><Music2 size={16} /> Official music library</span><span className="music-hero__separator" /><span>New songs and videos added regularly</span></div>
          <a className="music-hero__jump" href="#music-library-title">Explore all songs <ArrowDown size={15} aria-hidden="true" /></a>
        </div>
        {heroSong ? <a className="music-hero-feature" href={heroSong.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${heroSong.title} on YouTube`}>
          <div className="music-hero-feature__art"><PlaylistImage src={heroSong.thumbnail} alt={`${heroSong.title} artwork`} sizes="(max-width: 800px) 100vw, 45vw" priority /></div>
          <div className="music-hero-feature__shade" />
          <span className="music-hero-feature__badge"><Disc3 size={13} /> Song spotlight</span>
          <span className="music-hero-feature__copy"><span>{heroSong.duration || "YouTube"} · {heroSong.playlist?.title || "Zaheer Lohar"}</span><strong>{heroSong.title}</strong><span>Listen now <ArrowUpRight size={15} /></span></span>
          <span className="music-hero-feature__arrow" aria-hidden="true"><ArrowRight size={18} /></span>
        </a> : <MusicHeroArt />}
      </div>
    </section>
    <MusicLibrary />
  </main>;
}
