import Link from "next/link";
import { ArrowLeft, Disc3 } from "lucide-react";

export const metadata = {
  title: "Playlist unavailable",
  description: "This Zaheer Lohar playlist is unavailable or is no longer public.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function PlaylistNotFound() {
  return <main className="page-shell playlist-detail"><section className="playlist-state"><span className="playlist-state__mark"><Disc3 size={19} /></span><h1>Playlist not found</h1><p>This playlist may have been removed or is no longer public.</p><Link href="/playlists" className="button-dark"><ArrowLeft size={14} /> Back to playlists</Link></section></main>;
}
