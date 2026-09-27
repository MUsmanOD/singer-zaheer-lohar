"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Disc3, Play } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { PlaylistImage } from "@/components/playlists/playlist-image";

function PopularSongCard({ song, index }) {
  return <article className="popular-song-card"><a className="popular-song-card__link" href={song.videoUrl} target="_blank" rel="noreferrer" aria-label={`Play ${song.title} on YouTube`}>
    <div className="popular-song-card__artwork"><PlaylistImage src={song.thumbnail} alt="" sizes="(max-width: 680px) 88vw, (max-width: 980px) 44vw, 29vw" /><span className="popular-song-card__sequence">{String(index + 1).padStart(2, "0")}</span>{song.duration ? <span className="popular-song-card__duration">{song.duration}</span> : null}<span className="popular-song-card__play" aria-hidden="true"><Play size={18} fill="currentColor" /></span></div>
    <div className="popular-song-card__copy"><div><h3>{song.title}</h3><p>{song.playlist?.title || "A featured song"}</p></div><ArrowUpRight size={16} aria-hidden="true" /></div>
  </a></article>;
}

export function PopularSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function retry() {
    setLoading(true);
    setError(false);
    try { const result = await apiRequest("/api/videos/featured"); setSongs(result.data || []); }
    catch { setError(true); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/api/videos/featured", { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setSongs(result.data || []); })
      .catch((reason) => { if (!controller.signal.aborted && reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section className="popular-songs" aria-labelledby="popular-songs-title"><div className="page-shell">
    <header className="popular-songs__heading"><div><p className="eyebrow"><Disc3 size={13} /> The listening room</p><h2 id="popular-songs-title">Popular songs<span>.</span></h2></div><div className="popular-songs__intro"><p>A few favorites, chosen for the way they sound and the stories they carry.</p><Link href="/playlists">Explore all playlists <ArrowUpRight size={14} /></Link></div></header>
    {error ? <div className="popular-songs__state" role="status"><span>Songs are taking a moment to load.</span><button type="button" onClick={retry}>Try again</button></div> : loading ? <div className="popular-songs__grid" aria-label="Loading popular songs" aria-busy="true">{Array.from({ length: 3 }, (_, index) => <div className="popular-song-skeleton" key={index}><span /><i /><b /></div>)}</div> : songs.length ? <div className="popular-songs__grid">{songs.map((song, index) => <PopularSongCard key={song.id} song={song} index={index} />)}</div> : <div className="home-empty-state"><span>01 / Curated for you</span><p>Popular songs will appear here as they’re featured in the video library.</p></div>}
  </div></section>;
}
