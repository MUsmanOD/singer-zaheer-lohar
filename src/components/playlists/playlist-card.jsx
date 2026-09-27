import Link from "next/link";
import { ArrowUpRight, ListVideo } from "lucide-react";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { YouTubeIcon } from "@/components/icons/youtube-icon";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date));
}

export function PlaylistCard({ playlist, priority = false }) {
  return (
    <article className="playlist-card">
      <Link className="playlist-card__art" href={`/playlists/${encodeURIComponent(playlist.slug)}`} aria-label={`Open playlist: ${playlist.title}`}>
        <PlaylistImage src={playlist.thumbnail} alt={`${playlist.title} playlist cover`} priority={priority} />
        <span className="playlist-card__platform"><YouTubeIcon size={14} /> YouTube</span>
        <span className="playlist-card__play" aria-hidden="true"><ArrowUpRight size={19} /></span>
      </Link>
      <div className="playlist-card__copy">
        <div className="playlist-card__title-row">
          <h2><Link href={`/playlists/${encodeURIComponent(playlist.slug)}`}>{playlist.title}</Link></h2>
          {playlist.isFeatured ? <span className="playlist-card__featured">Featured</span> : null}
        </div>
        {playlist.description ? <p>{playlist.description}</p> : <p className="playlist-card__description-empty">An official collection of songs and performances.</p>}
        <div className="playlist-card__meta">
          <span><ListVideo size={15} aria-hidden="true" /> {playlist.videoCount} {playlist.videoCount === 1 ? "video" : "videos"}</span>
          {playlist.createdAt ? <span>Added {formatDate(playlist.createdAt)}</span> : null}
        </div>
        <Link className="playlist-card__link" href={`/playlists/${encodeURIComponent(playlist.slug)}`}>
          Explore playlist <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
