"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Disc3 } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { PlaylistImage } from "@/components/playlists/playlist-image";

export function PlaylistPreview() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/api/playlists?page=1&limit=4", { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setPlaylists((result.data || []).slice(0, 4)); })
      .catch((reason) => { if (!controller.signal.aborted && reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section className="home-playlists" aria-labelledby="home-playlists-title"><div className="page-shell">
    <div className="home-section-heading"><div><p className="eyebrow"><Disc3 size={13} /> Follow the sound</p><h2 id="home-playlists-title">Playlists<span>.</span></h2></div><Link href="/playlists" className="home-section-heading__all">View All Playlists <ArrowRight size={15} /></Link></div>
    {loading ? <div className="home-playlist-grid" aria-busy="true" aria-label="Loading playlists">{[1, 2, 3, 4].map((item) => <div className="home-playlist-skeleton" key={item}><i /><span /><b /></div>)}</div> : error ? <div className="home-empty-state"><span>02 / Curated collections</span><p>Playlists are taking a moment to load.</p></div> : playlists.length ? <div className="home-playlist-grid">{playlists.slice(0, 4).map((playlist, index) => <article className="home-playlist-card" key={playlist.id}><Link href={`/playlists/${encodeURIComponent(playlist.slug)}`} aria-label={`View playlist ${playlist.title}`}><div className="home-playlist-card__art"><PlaylistImage src={playlist.thumbnail} alt="" sizes="(max-width: 680px) 85vw, (max-width: 1000px) 42vw, 24vw" /><span>{String(index + 1).padStart(2, "0")}</span></div><div className="home-playlist-card__copy"><div><h3>{playlist.title}</h3><p>{playlist.videoCount} {playlist.videoCount === 1 ? "video" : "videos"}</p></div><span className="home-playlist-card__view">View <ArrowUpRight size={14} /></span></div></Link></article>)}</div> : <div className="home-empty-state"><span>02 / Curated collections</span><p>Playlists will appear here as they’re added to the library.</p></div>}
  </div></section>;
}
