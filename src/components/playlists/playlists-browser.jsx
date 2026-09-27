"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest, apiUrl } from "@/lib/api/client";
import { PlaylistCard } from "@/components/playlists/playlist-card";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { YouTubeIcon } from "@/components/icons/youtube-icon";

const DEFAULT_SETTINGS = {
  title: "Playlists",
  description: "Explore curated playlists, live performances, interviews, concerts, and the songs behind the moments.",
};

function PlaylistCardSkeleton() {
  return <div className="playlist-skeleton" aria-hidden="true"><div className="playlist-skeleton__art" /><div className="playlist-skeleton__line playlist-skeleton__line--title" /><div className="playlist-skeleton__line" /><div className="playlist-skeleton__line playlist-skeleton__line--short" /></div>;
}

export function PlaylistsBrowser() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [featured, setFeatured] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPlaylists = useCallback(async ({ nextPage = 1, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const response = await apiRequest(apiUrl("/api/playlists", { page: nextPage, search: debouncedSearch }));
      setPlaylists((current) => append ? [...current, ...response.data] : response.data);
      setPagination(response.pagination);
      setPage(nextPage);
    } catch (reason) {
      setError(reason.message);
      if (!append) setPlaylists([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPlaylists({ nextPage: 1 }); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPlaylists]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiRequest("/api/playlists/featured"),
      apiRequest("/api/playlists/settings"),
    ]).then(([featuredResult, settingsResult]) => {
      if (!active) return;
      if (featuredResult.status === "fulfilled") setFeatured(featuredResult.value.data);
      if (settingsResult.status === "fulfilled") setSettings(settingsResult.value.data);
    });
    return () => { active = false; };
  }, []);

  const heroPlaylist = featured[0];

  return (
    <main className="playlists-page">
      <section className="playlist-hero" aria-labelledby="playlists-title">
        <div className="page-shell playlist-hero__inner">
          <div className="playlist-hero__copy">
            <p className="eyebrow"><span className="playlist-hero__spark"><Sparkles size={13} /></span> The music, collected</p>
            <h1 id="playlists-title" className="type-heading">{settings.title || DEFAULT_SETTINGS.title}<span className="playlist-hero__period">.</span></h1>
            <p className="playlist-hero__description">{settings.description || DEFAULT_SETTINGS.description}</p>
            <div className="playlist-hero__meta"><span><YouTubeIcon size={16} /> Official collections</span><span className="playlist-hero__separator" /><span>Updated as new music arrives</span></div>
            <a className="playlist-hero__jump" href="#all-playlists">Browse all playlists <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
          {heroPlaylist ? (
            <Link className="playlist-hero-feature" href={`/playlists/${encodeURIComponent(heroPlaylist.slug)}`}>
              <div className="playlist-hero-feature__art"><PlaylistImage src={heroPlaylist.thumbnail} alt={`${heroPlaylist.title} cover`} sizes="(max-width: 800px) 100vw, 45vw" priority /></div>
              <div className="playlist-hero-feature__shade" />
              <span className="playlist-hero-feature__badge"><Sparkles size={13} /> Featured collection</span>
              <span className="playlist-hero-feature__copy"><span>{heroPlaylist.videoCount} videos · YouTube</span><strong>{heroPlaylist.title}</strong><span>Listen now <ArrowUpRight size={15} /></span></span>
              <span className="playlist-hero-feature__arrow" aria-hidden="true"><ArrowRight size={18} /></span>
            </Link>
          ) : (
            <div className="playlist-hero-art" aria-hidden="true"><div className="playlist-hero-art__disc"><span /></div><span className="playlist-hero-art__label">ZAHEER<br />LOHAR</span><span className="playlist-hero-art__note playlist-hero-art__note--one">♪</span><span className="playlist-hero-art__note playlist-hero-art__note--two">♫</span></div>
          )}
        </div>
      </section>

      {featured.length > 1 && !debouncedSearch ? (
        <section className="page-shell playlist-featured-section" aria-labelledby="featured-title">
          <div className="playlist-section-heading"><div><p className="eyebrow">Hand-picked for you</p><h2 id="featured-title">Featured playlists</h2></div><span>{featured.length} collections</span></div>
          <div className="playlist-grid playlist-grid--featured">{featured.slice(1, 4).map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div>
        </section>
      ) : null}

      <section id="all-playlists" className="page-shell playlist-library" aria-labelledby="library-title">
        <div className="playlist-library__heading">
          <div className="playlist-section-heading playlist-section-heading--library">
            <div><p className="eyebrow">Explore the collection</p><h2 id="library-title">All playlists</h2></div>
            {!loading && !error ? <span>{pagination.total} {pagination.total === 1 ? "playlist" : "playlists"}</span> : null}
          </div>
          <label className="playlist-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search playlists</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a playlist" maxLength={100} />
            {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button> : null}
          </label>
        </div>

        {error ? (
          <div className="playlist-state playlist-state--error" role="alert"><span className="playlist-state__mark">!</span><h3>We couldn’t load the playlists</h3><p>{error}</p><button type="button" className="button-dark" onClick={() => loadPlaylists({ nextPage: 1 })}>Try again</button></div>
        ) : loading ? (
          <div className="playlist-grid" aria-label="Loading playlists">{Array.from({ length: 6 }, (_, index) => <PlaylistCardSkeleton key={index} />)}</div>
        ) : playlists.length ? (
          <>
            <div className="playlist-grid">{playlists.map((playlist, index) => <PlaylistCard key={playlist.id} playlist={playlist} priority={index < 2} />)}</div>
            {page < pagination.totalPages ? <div className="playlist-load-more"><button type="button" className="button-light" onClick={() => loadPlaylists({ nextPage: page + 1, append: true })} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more playlists"}<ArrowDown size={15} /></button></div> : null}
          </>
        ) : (
          <div className="playlist-state"><div className="playlist-state__mark"><Search size={20} /></div><h3>{debouncedSearch ? "No playlists match that search" : "No playlists are available yet"}</h3><p>{debouncedSearch ? "Try another title or clear the search to see everything." : "New playlists will appear here as the collection grows."}</p>{debouncedSearch ? <button type="button" className="text-link" onClick={() => setSearch("")}>Clear search</button> : null}</div>
        )}
      </section>
    </main>
  );
}
