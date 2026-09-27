import { apiRequest, apiUrl } from "@/lib/api/client";

export function getAdminPlaylists(query = {}) {
  return apiRequest(apiUrl("/api/admin/playlists", query));
}

export function createAdminPlaylist(values) {
  return apiRequest("/api/admin/playlists", { method: "POST", body: JSON.stringify(values) });
}

export function updateAdminPlaylist(id, values) {
  return apiRequest(`/api/admin/playlists/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(values) });
}

export function deleteAdminPlaylist(id) {
  return apiRequest(`/api/admin/playlists/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function refreshAdminPlaylist(id) {
  return apiRequest(`/api/admin/playlists/${encodeURIComponent(id)}/refresh`, { method: "POST", body: "{}" });
}

export function setAdminPlaylistStatus(id, status) {
  return apiRequest(`/api/admin/playlists/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function setAdminPlaylistFeatured(id, isFeatured) {
  return apiRequest(`/api/admin/playlists/${encodeURIComponent(id)}/featured`, { method: "PATCH", body: JSON.stringify({ isFeatured }) });
}

export function getAdminDashboardStats() {
  return apiRequest("/api/admin/dashboard/stats");
}

export function getAdminVideos(query = {}) {
  return apiRequest(apiUrl("/api/admin/videos", query));
}

export function createAdminVideo(values) {
  return apiRequest("/api/admin/videos", { method: "POST", body: JSON.stringify(values) });
}

export function setAdminVideoFeatured(id, isFeatured) {
  return apiRequest(`/api/admin/videos/${encodeURIComponent(id)}/featured`, {
    method: "PATCH",
    body: JSON.stringify({ isFeatured }),
  });
}

export function getAdminVideo(id) {
  return apiRequest(`/api/admin/videos/${encodeURIComponent(id)}`);
}

export function updateAdminVideo(id, values) {
  return apiRequest(`/api/admin/videos/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(values) });
}

export function deleteAdminVideo(id) {
  return apiRequest(`/api/admin/videos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function setAdminVideoStatus(id, status) {
  return apiRequest(`/api/admin/videos/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function getAdminSettings() {
  return apiRequest("/api/admin/settings");
}

export function updateAdminSettings(values) {
  return apiRequest("/api/admin/settings", { method: "PUT", body: JSON.stringify(values) });
}

export function getAdminBookings(query = {}) {
  return apiRequest(apiUrl("/api/admin/bookings", query));
}

export function getAdminBooking(id) {
  return apiRequest(`/api/admin/bookings/${encodeURIComponent(id)}`);
}

export function updateAdminBooking(id, values) {
  return apiRequest(`/api/admin/bookings/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(values) });
}

export function getAdminNotifications(options = {}) {
  return apiRequest("/api/admin/notifications", options);
}

export function markAdminNotificationRead(id) {
  return apiRequest(`/api/admin/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", body: "{}" });
}

export function getAdminPromotions(query = {}) {
  return apiRequest(apiUrl("/api/admin/promotions", query));
}

export function getAdminPromotion(id) {
  return apiRequest(`/api/admin/promotions/${encodeURIComponent(id)}`);
}

export function updateAdminPromotion(id, values) {
  return apiRequest(`/api/admin/promotions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(values) });
}
