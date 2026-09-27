"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Disc3, Play, Search } from "lucide-react";
import { apiUrl, apiRequest } from "@/lib/api/client";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { Input } from "@/components/ui/input";

function excerpt(value, maximum = 170) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "A song from Zaheer Lohar’s music library.";
  return text.length > maximum ? `${text.slice(0, maximum).trimEnd()}…` : text;
}

function songKey(song) {
  return song.externalVideoId || song.id || song.videoUrl;
}

function uniqueSongs(items) {
  const seen = new Set();
  return items.filter((song) => {
    const key = songKey(song);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function MusicCard({ song, index }) {
  return <article className="music-card">
    <a className="music-card__art" href={song.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Play ${song.title} on YouTube`}>
      <PlaylistImage src={song.thumbnail} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" />
      <span className="music-card__number">{String(index).padStart(2, "0")}</span>
      {song.duration ? <span className="music-card__duration">{song.duration}</span> : null}
      <span className="music-card__play"><Play size={18} fill="currentColor" /></span>
    </a>
    <div className="music-card__copy"><div><h2>{song.title}</h2><p>{excerpt(song.description)}</p>{song.playlist?.title ? <span className="music-card__collection">{song.playlist.title}</span> : null}</div><a className="music-card__open" href={song.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${song.title} on YouTube`}><ArrowUpRight size={16} /></a></div>
  </article>;
}

export function MusicLibrary() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async ({ nextPage = 1, append = false } = {}) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const result = await apiRequest(apiUrl("/api/videos", { page: nextPage, limit: 18, search }), { signal: controller.signal });
      if (controller.signal.aborted || activeRequest.current !== controller) return;
      const incoming = result.data || [];
      setSongs((current) => uniqueSongs(append ? [...current, ...incoming] : incoming));
      setPagination(result.pagination || { page: nextPage, total: 0, totalPages: 0 });
      setPage(nextPage);
    } catch (reason) {
      if (!controller.signal.aborted && activeRequest.current === controller && reason.name !== "AbortError") setError(reason.message || "The music library could not be loaded.");
    } finally {
      if (activeRequest.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSongs([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
      void load({ nextPage: 1 });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      activeRequest.current?.abort();
    };
  }, [load]);

  return <section className="music-library page-shell" aria-labelledby="music-library-title">
    <div className="music-library__toolbar"><div><p className="eyebrow"><Disc3 size={13} /> From the library</p><h2 id="music-library-title">Songs &amp; stories</h2><p className="music-library__count">{pagination.total} {pagination.total === 1 ? "release" : "releases"}</p></div><label className="music-library__search"><Search size={17} /><span className="sr-only">Search songs</span><Input type="search" maxLength={100} placeholder="Search songs" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></label></div>
    {error ? <div className="music-library__state" role="alert"><strong>We couldn’t load the songs.</strong><p>{error}</p><button type="button" onClick={() => { void load({ nextPage: 1 }); }}>Try again</button></div> : loading ? <div className="music-library__grid" aria-busy="true" aria-label="Loading songs">{Array.from({ length: 6 }, (_, index) => <div className="music-library-skeleton" key={index}><span /><i /><b /></div>)}</div> : songs.length ? <><div className="music-library__grid">{songs.map((song, index) => <MusicCard key={songKey(song)} song={song} index={index + 1} />)}</div>{loadingMore ? <div className="music-library__grid music-library__grid--loading-more" aria-busy="true" aria-label="Loading more songs">{Array.from({ length: 3 }, (_, index) => <div className="music-library-skeleton" key={index}><span /><i /><b /></div>)}</div> : null}{pagination.totalPages > 1 ? <nav className="music-library__pagination" aria-label="Music pages"><span>Page {page} of {pagination.totalPages} · {songs.length} of {pagination.total} songs</span><button type="button" disabled={page >= pagination.totalPages || loadingMore} onClick={() => { void load({ nextPage: page + 1, append: true }); }}>{loadingMore ? "Loading…" : page >= pagination.totalPages ? "All songs loaded" : "Next"} {!loadingMore ? <ArrowRight size={14} /> : null}</button></nav> : null}</> : <div className="music-library__state"><span className="music-library__empty-icon"><Disc3 size={19} /></span><strong>{search ? "No songs match that search." : "The catalogue is taking shape."}</strong><p>{search ? "Try a different title or clear the search." : "New releases will appear here as they’re added to the library."}</p>{search ? <button type="button" onClick={() => setSearchInput("")}>Clear search</button> : null}</div>}
  </section>;
}
