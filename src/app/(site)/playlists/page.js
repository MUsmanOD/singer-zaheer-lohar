import { PlaylistsBrowser } from "@/components/playlists/playlists-browser";
import { cache } from "react";
import { connectDb } from "@/lib/db/connection";
import { getSettings } from "@/lib/services/playlist-manager";
import { createPageMetadata } from "@/lib/seo/site";

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
  return createPageMetadata({
    title,
    description,
    path: "/playlists",
    image: "/images/playlist-placeholder.svg",
    imageAlt: "Playlist collections from Zaheer Lohar",
    keywords: ["Zaheer Lohar playlists", "Punjabi music playlists", "Pakistani folk music collection", "YouTube playlists"],
  });
}

export default function PlaylistsPage() {
  return <PlaylistsBrowser />;
}
