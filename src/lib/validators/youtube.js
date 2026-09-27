const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9_-]{10,80}$/;

function parseUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:"
      || !YOUTUBE_HOSTS.has(hostname)
      || url.username
      || url.password
      || (url.port && url.port !== "443")
    ) return null;
    return { url, hostname };
  } catch {
    return null;
  }
}

export function parseYouTubeUrl(value) {
  const parsed = parseUrl(value);
  if (!parsed) return { type: "invalid", message: "Paste a secure YouTube video or playlist link." };
  const { url, hostname } = parsed;
  const listId = url.searchParams.get("list") || "";

  if (url.pathname === "/watch") {
    const videoId = url.searchParams.get("v") || "";
    if (videoId) {
      if (!VIDEO_ID_PATTERN.test(videoId)) return { type: "invalid", message: "That video link does not contain a valid YouTube video ID." };
      return { type: "video", id: videoId, normalizedUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` };
    }
    if (listId) {
      if (!PLAYLIST_ID_PATTERN.test(listId)) return { type: "invalid", message: "That link does not contain a valid YouTube playlist ID." };
      return { type: "playlist", id: listId, normalizedUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(listId)}` };
    }
    return { type: "invalid", message: "That YouTube link needs a video ID or playlist ID." };
  }

  if (url.pathname === "/playlist") {
    if (!PLAYLIST_ID_PATTERN.test(listId)) return { type: "invalid", message: "That playlist link does not contain a valid YouTube playlist ID." };
    return { type: "playlist", id: listId, normalizedUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(listId)}` };
  }

  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    const videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    if (VIDEO_ID_PATTERN.test(videoId)) {
      return { type: "video", id: videoId, normalizedUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` };
    }
  } else {
    const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/);
    if (match && VIDEO_ID_PATTERN.test(match[1])) {
      return { type: "video", id: match[1], normalizedUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(match[1])}` };
    }
  }

  return { type: "invalid", message: "Use a YouTube watch, Shorts, playlist, embed, or youtu.be link." };
}

