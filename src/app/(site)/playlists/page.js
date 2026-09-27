import { PlaylistsBrowser } from "@/components/playlists/playlists-browser";
import { cache } from "react";
import { connectDb } from "@/lib/db/connection";
import { getSettings } from "@/lib/services/playlist-manager";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const dynamic = "force-dynamic";

const readSettings = cache(async () => {
  try {
    await connectDb();
    return await getSettings();
  } catch {
    return null;
  }
});

export async function generateMetadata() {
  const settings = await readSettings();
  const title = settings?.playlistPageTitle || "Playlists";
  const description = settings?.playlistPageDescription || "Explore curated playlists, live performances, interviews, concerts, and music from Zaheer Lohar.";
  const canonical = siteUrl ? new URL("/playlists", siteUrl).toString() : undefined;
  const socialImage = siteUrl ? new URL("/images/playlist-placeholder.svg", siteUrl).toString() : undefined;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: `${title} — Zaheer Lohar`,
      description,
      type: "website",
      url: canonical,
      images: socialImage ? [{ url: socialImage, alt: "Playlist collections from Zaheer Lohar" }] : undefined,
    },
    twitter: { card: "summary_large_image", title: `${title} — Zaheer Lohar`, description, images: socialImage ? [socialImage] : undefined },
  };
}

export default function PlaylistsPage() {
  return <PlaylistsBrowser />;
}
