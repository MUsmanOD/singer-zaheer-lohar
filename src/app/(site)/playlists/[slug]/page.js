import { cache } from "react";
import { notFound } from "next/navigation";
import { PlaylistDetail } from "@/components/playlists/playlist-detail";
import { connectDb } from "@/lib/db/connection";
import { getPublicPlaylist, listPlaylistVideos } from "@/lib/services/playlist-manager";

export const dynamic = "force-dynamic";

const getInitialData = cache(async (slug) => {
  try {
    await connectDb();
    const playlist = await getPublicPlaylist(slug);
    if (!playlist) return { missing: true };
    const videos = await listPlaylistVideos(slug, { page: 1, limit: 24 });
    return { playlist, videos: videos?.rows || [], pagination: videos ? { page: 1, limit: 24, total: videos.total, totalPages: Math.ceil(videos.total / 24) } : null };
  } catch {
    return { unavailable: true };
  }
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const initial = await getInitialData(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = siteUrl ? new URL(`/playlists/${encodeURIComponent(slug)}`, siteUrl).toString() : undefined;
  if (!initial?.playlist) return { title: "Playlist unavailable", robots: { index: false, follow: false } };
  return {
    title: initial.playlist.title,
    description: initial.playlist.description || `${initial.playlist.videoCount} videos in this playlist from Zaheer Lohar.`,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: `${initial.playlist.title} — Zaheer Lohar`,
      description: initial.playlist.description || "Watch the official collection from Zaheer Lohar.",
      type: "website",
      url: canonical,
      images: initial.playlist.thumbnail ? [{ url: initial.playlist.thumbnail, width: 1280, height: 720, alt: initial.playlist.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${initial.playlist.title} — Zaheer Lohar`,
      description: initial.playlist.description || undefined,
      images: initial.playlist.thumbnail ? [initial.playlist.thumbnail] : undefined,
    },
  };
}

export default async function PlaylistDetailPage({ params }) {
  const { slug } = await params;
  const initial = await getInitialData(slug);
  if (initial?.missing) notFound();
  const playlist = initial?.playlist;
  const jsonLd = playlist ? {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    name: playlist.title,
    description: playlist.description,
    numTracks: playlist.videoCount,
    image: playlist.thumbnail || undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL ? new URL(`/playlists/${encodeURIComponent(slug)}`, process.env.NEXT_PUBLIC_SITE_URL).toString() : undefined,
    sameAs: playlist.playlistUrl,
  } : null;
  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <PlaylistDetail slug={slug} initialPlaylist={playlist || null} initialVideos={initial?.videos || null} initialPagination={initial?.pagination || null} />
    </>
  );
}
