"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { PlaylistImage } from "@/components/playlists/playlist-image";

function descriptionPreview(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > 136 ? `${text.slice(0, 136).trimEnd()}…` : text;
}

function LatestCard({ video, index }) {
  const detail = descriptionPreview(video.description);
  return <article className="latest-song-card"><a href={video.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Play ${video.title} on YouTube`}><div className="latest-song-card__art"><PlaylistImage src={video.thumbnail} alt="" sizes="(max-width: 700px) 100vw, 33vw" /><span className="latest-song-card__number">{String(index + 1).padStart(2, "0")}</span>{video.duration ? <span className="latest-song-card__duration">{video.duration}</span> : null}<i><Play size={17} fill="currentColor" /></i></div><div className="latest-song-card__copy"><div><p className="latest-song-card__source">{video.playlist?.title || "Latest release"}</p><h3 title={video.title}>{video.title}</h3>{detail ? <p className="latest-song-card__detail" title={video.description}>{detail}</p> : null}</div><ArrowUpRight size={16} /></div></a></article>;
}

export function LatestSongs() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/api/videos?page=1&limit=3", { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setVideos(result.data || []); })
      .catch((reason) => { if (!controller.signal.aborted && reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section className="latest-songs" aria-labelledby="latest-songs-title"><div className="page-shell">
    <div className="home-section-heading"><div><p className="eyebrow">Fresh from the studio</p><h2 id="latest-songs-title">Latest songs<span>.</span></h2></div><Link href="/playlists">Browse the library <ArrowRight size={15} /></Link></div>
    {loading ? <div className="latest-song-grid" aria-busy="true" aria-label="Loading latest songs">{[1, 2, 3].map((item) => <div className="latest-song-skeleton" key={item}><i /><span /><b /></div>)}</div> : error ? <div className="home-empty-state"><span>01 / The latest</span><p>New music is taking a moment to load. Please check back shortly.</p></div> : videos.length ? <div className="latest-song-grid">{videos.slice(0, 3).map((video, index) => <LatestCard key={video.id} video={video} index={index} />)}</div> : <div className="home-empty-state"><span>01 / The latest</span><p>New songs will appear here as they’re added to the library.</p></div>}
  </div></section>;
}
