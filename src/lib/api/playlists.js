import { apiRequest, apiUrl } from "@/lib/api/client";

export function getPublicPlaylists(query = {}) {
  return apiRequest(apiUrl("/api/playlists", query));
}

export function getFeaturedPlaylists() {
  return apiRequest("/api/playlists/featured");
}

export function getPlaylistSettings() {
  return apiRequest("/api/playlists/settings");
}

export function getPublicPlaylist(slug) {
  return apiRequest(`/api/playlists/${encodeURIComponent(slug)}`);
}

export function getPlaylistVideos(slug, query = {}) {
  return apiRequest(apiUrl(`/api/playlists/${encodeURIComponent(slug)}/videos`, query));
}
