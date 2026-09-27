"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, ListVideo, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { YouTubeIcon } from "@/components/icons/youtube-icon";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function VideoCard({ video, index }) {
  return (
    <article className="playlist-video-card">
      <span className="playlist-video-card__number">{String((Number.isInteger(video.position) ? video.position : index) + 1).padStart(2, "0")}</span>
      <a className="playlist-video-card__art" href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`Play ${video.title} on YouTube`}>
        <PlaylistImage src={video.thumbnail} alt={`${video.title} thumbnail`} sizes="(max-width: 720px) 44vw, (max-width: 1100px) 28vw, 20vw" />
        <span className="playlist-video-card__play"><Play size={17} fill="currentColor" aria-hidden="true" /></span>
        {video.duration ? <span className="playlist-video-card__duration"><Clock3 size={11} /> {video.duration}</span> : null}
      </a>
      <div className="playlist-video-card__copy">
        <h3><a href={video.videoUrl} target="_blank" rel="noreferrer">{video.title}</a></h3>
        <p>{formatDate(video.publishedAt) || `Video ${(Number.isInteger(video.position) ? video.position : index) + 1}`} <span>·</span> <a href={video.videoUrl} target="_blank" rel="noreferrer">Watch on YouTube <ArrowUpRight size={12} /></a></p>
      </div>
    </article>
  );
}

export function PlaylistDetail({ slug, initialPlaylist = null, initialVideos = null, initialPagination = null }) {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [videos, setVideos] = useState(initialVideos || []);
  const [pagination, setPagination] = useState(initialPagination || { page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(!initialPlaylist);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const [playlistResult, videoResult] = await Promise.all([
        apiRequest(`/api/playlists/${encodeURIComponent(slug)}`),
        apiRequest(`/api/playlists/${encodeURIComponent(slug)}/videos?page=${nextPage}&limit=24`),
      ]);
      setPlaylist(playlistResult.data);
      setVideos((current) => append ? [...current, ...videoResult.data] : videoResult.data);
      setPagination(videoResult.pagination);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!initialPlaylist) {
      const timer = window.setTimeout(() => { void load(); }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [initialPlaylist, load]);

  if (loading) return <main className="playlist-detail page-shell"><div className="playlist-detail-skeleton" aria-label="Loading playlist"><div /><div /><div /></div></main>;
  if (error || !playlist) return (
    <main className="page-shell playlist-detail"><div className="playlist-state playlist-state--error" role="alert"><span className="playlist-state__mark">!</span><h1>Playlist unavailable</h1><p>{error || "This playlist may have been removed or made private."}</p><div className="playlist-state__actions"><Link className="button-dark" href="/playlists"><ArrowLeft size={15} /> Back to playlists</Link><button type="button" className="button-light" onClick={() => load()}>Try again</button></div></div></main>
  );

  return (
    <main className="playlist-detail">
      <section className="playlist-detail-hero">
        <div className="page-shell playlist-detail-hero__inner">
          <div className="playlist-detail-hero__back-row"><Link href="/playlists" className="playlist-back-link"><ArrowLeft size={15} /> All playlists</Link><span className="playlist-detail-hero__label"><YouTubeIcon size={14} /> Official YouTube playlist</span></div>
          <div className="playlist-detail-hero__layout">
            <div className="playlist-detail-cover"><PlaylistImage src={playlist.thumbnail} alt={`${playlist.title} cover`} sizes="(max-width: 720px) 88vw, 380px" priority /><span><Play fill="currentColor" size={21} /></span></div>
            <div className="playlist-detail-copy">
              <p className="eyebrow">Playlist · {playlist.isFeatured ? "Featured collection" : "Zaheer Lohar"}</p>
              <h1>{playlist.title}</h1>
              <p className="playlist-detail-description">{playlist.description || "A collected set of songs, performances, and moments from the music."}</p>
              <div className="playlist-detail-stats"><span><ListVideo size={16} /> {playlist.videoCount} {playlist.videoCount === 1 ? "video" : "videos"}</span>{playlist.createdAt ? <span>Added {formatDate(playlist.createdAt)}</span> : null}</div>
              <a className="button-dark playlist-detail-cta" href={playlist.playlistUrl} target="_blank" rel="noreferrer"><Play fill="currentColor" size={15} /> Play on YouTube <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell playlist-videos-section" aria-labelledby="playlist-videos-heading">
        <div className="playlist-section-heading"><div><p className="eyebrow">In this collection</p><h2 id="playlist-videos-heading">Videos</h2></div><span>{pagination.total || playlist.videoCount} tracks</span></div>
        {videos.length ? <div className="playlist-video-grid">{videos.map((video, index) => <VideoCard key={video.id || video.externalVideoId} video={video} index={index} />)}</div> : <div className="playlist-state"><div className="playlist-state__mark"><Play size={18} /></div><h3>No videos are available yet</h3><p>The collection may still be synchronizing. Check back soon.</p></div>}
        {pagination.page < pagination.totalPages ? <div className="playlist-load-more"><button className="button-light" type="button" onClick={() => load(pagination.page + 1, true)} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more videos"}<ArrowUpRight size={15} /></button></div> : null}
      </section>
    </main>
  );
}
