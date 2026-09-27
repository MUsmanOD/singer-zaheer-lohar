import { revalidatePath } from "next/cache";

export function revalidatePlaylistPages(slug) {
  revalidatePath("/");
  revalidatePath("/playlists");
  revalidatePath("/playlists/[slug]", "page");
  revalidatePath("/api/playlists");
  revalidatePath("/api/playlists/featured");
  revalidatePath("/api/videos");
  revalidatePath("/api/videos/featured");
  if (slug) {
    revalidatePath(`/playlists/${slug}`);
    revalidatePath(`/api/playlists/${slug}`);
    revalidatePath(`/api/playlists/${slug}/videos`);
  }
}

export function revalidateHomeVideos() {
  revalidatePath("/");
  revalidatePath("/api/videos");
  revalidatePath("/api/videos/featured");
}
