"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleAlert, ListVideo, LoaderCircle, Pencil, Plus, Power, RefreshCw, Search, Star, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { deleteAdminVideo, getAdminPlaylists, getAdminVideos, setAdminVideoFeatured, setAdminVideoStatus, updateAdminVideo } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { useAdminToast } from "@/components/admin/admin-toast";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

function dateLabel(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function AdminVideos() {
  const toast = useAdminToast();
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredBusyId, setFeaturedBusyId] = useState("");
  const [statusBusyId, setStatusBusyId] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "active", isFeatured: false, displayOrder: 0 });
  const [editBusy, setEditBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getAdminPlaylists({ page: 1, limit: 100, sort: "title" }).then((result) => setPlaylists(result.data)).catch(() => setPlaylists([]));
  }, []);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminVideos({ page: targetPage, limit: 20, search: query, playlistId, status });
      setVideos(result.data);
      setPagination(result.pagination);
      setPage(targetPage);
    } catch (reason) {
      setVideos([]);
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, [playlistId, query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(1); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function syncPlaylist() {
    const playlist = playlists.find((item) => item.id === playlistId);
    if (!playlist) return;
    setRefreshing(true);
    try {
      const result = await apiRequest(`/api/admin/playlists/${encodeURIComponent(playlist.id)}/refresh`, { method: "POST", body: "{}" });
      toast(result.message || "Playlist videos synchronized.");
      await load(page);
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setRefreshing(false);
    }
  }

  async function toggleFeatured(video) {
    setFeaturedBusyId(video.id);
    try {
      const nextValue = !video.isFeatured;
      const result = await setAdminVideoFeatured(video.id, nextValue);
      setVideos((current) => current.map((item) => item.id === video.id ? { ...item, isFeatured: nextValue } : item));
      toast(result.message || (nextValue ? "Song featured on the homepage." : "Song removed from the homepage."));
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setFeaturedBusyId("");
    }
  }

  function openEdit(video) {
    setEditing(video);
    setEditForm({ title: video.title, description: video.description || "", status: video.status || "active", isFeatured: Boolean(video.isFeatured), displayOrder: Number(video.displayOrder || 0) });
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editing) return;
    setEditBusy(true);
    try {
      const result = await updateAdminVideo(editing.id, editForm);
      setVideos((current) => current.map((item) => item.id === editing.id ? { ...item, ...result.data } : item));
      setEditing(null);
      toast(result.message || "Video updated.");
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function toggleStatus(video) {
    setStatusBusyId(video.id);
    try {
      const nextStatus = (video.status || "active") === "active" ? "inactive" : "active";
      const result = await setAdminVideoStatus(video.id, nextStatus);
      setVideos((current) => current.map((item) => item.id === video.id ? { ...item, ...result.data, status: nextStatus, isFeatured: nextStatus === "inactive" ? false : item.isFeatured } : item));
      toast(result.message || `Video ${nextStatus === "active" ? "activated" : "deactivated"}.`);
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setStatusBusyId("");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setStatusBusyId(deleteTarget.id);
    try {
      const result = await deleteAdminVideo(deleteTarget.id);
      setDeleteTarget(null);
      toast(result.message || "Video deleted.");
      await load(videos.length === 1 && page > 1 ? page - 1 : page);
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setStatusBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Video library</p><h1>Videos</h1><p>Manage playlist videos, add a YouTube link, and curate songs for the homepage.</p></div><div className="admin-video-heading-actions"><Link className="admin-button admin-button--primary" href="/admin/videos/new"><Plus size={15} /> Add video</Link><button className="admin-button admin-button--secondary" type="button" onClick={() => load(page)} disabled={loading}><RefreshCw size={15} className={loading ? "is-spinning" : ""} /> Refresh list</button></div></div>
      <section className="admin-panel admin-playlists-panel">
        <div className="admin-list-toolbar"><label className="admin-search"><Search size={16} /><span className="sr-only">Search videos</span><Input type="search" placeholder="Search video titles…" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="admin-filter-row"><Select value={playlistId || "all"} onValueChange={(value) => { setPlaylistId(value === "all" ? "" : value); setPage(1); }}><SelectTrigger aria-label="Filter by playlist" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All playlists</SelectItem>{playlists.map((playlist) => <SelectItem key={playlist.id} value={playlist.id}>{playlist.title}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger aria-label="Filter by status" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><button className="admin-button admin-button--secondary" type="button" onClick={syncPlaylist} disabled={!playlistId || refreshing}><RefreshCw size={14} className={refreshing ? "is-spinning" : ""} /> {refreshing ? "Syncing…" : "Sync selected playlist"}</button></div>
        </div>
        <div className="admin-table-summary"><span>{loading ? "Loading videos…" : `${pagination.total} ${pagination.total === 1 ? "video" : "videos"}`}</span><span>Video metadata is synchronized from YouTube</span></div>
        {error ? <div className="admin-table-state admin-table-state--error" role="alert"><strong>We couldn’t load videos</strong><span>{error}</span><button type="button" className="admin-button admin-button--secondary" onClick={() => load(1)}>Try again</button></div> : loading ? <div className="admin-table-loading" aria-label="Loading videos">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div> : videos.length ? <DataTable><thead><tr><th>Video</th><th>Playlist</th><th>Position</th><th>Featured</th><th>Status</th><th>Published</th><th>External ID</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{videos.map((video) => <tr key={video.id}><td><div className="admin-video-cell"><Link className="admin-video-thumb" href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`Open ${video.title} on YouTube`}><Image src={video.thumbnail || "/images/playlist-placeholder.svg"} alt="" fill sizes="128px" /></Link><span><a className="admin-video-title" href={video.videoUrl} target="_blank" rel="noreferrer">{video.title}</a><small>{video.duration || "Video"}{video.source === "manual" ? " · Added by link" : ""}</small></span></div></td><td>{video.playlist ? <Link className="admin-video-playlist" href={`/playlists/${encodeURIComponent(video.playlist.slug)}`} target="_blank">{video.playlist.title}<ArrowUpRight size={12} /></Link> : video.source === "manual" ? <span className="admin-muted">Independent video</span> : <span className="admin-muted">Playlist unavailable</span>}</td><td>{video.source === "manual" ? <span className="admin-muted">—</span> : <span className="admin-position-pill">{String(video.position + 1).padStart(2, "0")}</span>}</td><td><button type="button" className={`admin-feature-toggle${video.isFeatured ? " is-featured" : ""}`} disabled={featuredBusyId === video.id || (video.status || "active") === "inactive"} aria-label={video.isFeatured ? `Remove ${video.title} from Popular songs` : `Feature ${video.title} on the homepage`} title={(video.status || "active") === "inactive" ? "Activate this video to feature it" : video.isFeatured ? "Remove from Popular songs" : "Feature on homepage"} onClick={() => toggleFeatured(video)}>{featuredBusyId === video.id ? <LoaderCircle size={15} className="is-spinning" /> : <Star size={16} fill={video.isFeatured ? "currentColor" : "none"} />}</button></td><td><span className={`admin-status-pill admin-status-pill--${video.status || "active"}`}><i />{video.status || "active"}</span></td><td className="admin-date-cell">{dateLabel(video.publishedAt)}</td><td><code className="admin-video-id">{video.externalVideoId}</code></td><td><div className="admin-row-actions"><button type="button" className="admin-icon-action" onClick={() => openEdit(video)} aria-label={`Edit ${video.title}`} title="Edit video"><Pencil size={15} /></button><button type="button" className="admin-icon-action" onClick={() => toggleStatus(video)} disabled={statusBusyId === video.id} aria-label={`${(video.status || "active") === "active" ? "Deactivate" : "Activate"} ${video.title}`} title={(video.status || "active") === "active" ? "Deactivate video" : "Activate video"}>{statusBusyId === video.id ? <LoaderCircle size={15} className="is-spinning" /> : <Power size={15} />}</button><button type="button" className="admin-icon-action admin-icon-action--danger" onClick={() => setDeleteTarget(video)} disabled={statusBusyId === video.id} aria-label={`Delete ${video.title}`} title="Delete video"><Trash2 size={15} /></button><a className="admin-icon-action" href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${video.title} on YouTube`}><YouTubeIcon size={17} /></a></div></td></tr>)}</tbody></DataTable> : <div className="admin-table-state"><span className="admin-table-state__icon"><ListVideo size={22} /></span><strong>{query || playlistId || status !== "all" ? "No videos found" : "Your video library is empty"}</strong><span>{query || playlistId || status !== "all" ? "Try changing your search or filters." : "Add a YouTube link or synchronize a playlist to get started."}</span>{!query && !playlistId && status === "all" ? <div className="admin-empty-actions"><Link href="/admin/videos/new" className="admin-button admin-button--primary"><Plus size={15} /> Add a video</Link><Link href="/admin/playlists" className="admin-button admin-button--secondary">Go to playlists <ArrowUpRight size={15} /></Link></div> : null}</div>}
        {!error && pagination.totalPages > 1 ? <div className="admin-pagination"><span>Page {pagination.page} of {pagination.totalPages}</span><div><button type="button" className="admin-pagination__button" disabled={loading || page <= 1} onClick={() => load(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button><button type="button" className="admin-pagination__button" disabled={loading || page >= pagination.totalPages} onClick={() => load(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button></div></div> : null}
      </section>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open && !editBusy) setEditing(null); }} title="Edit video" description="Update the metadata and visibility for this video." className="admin-video-dialog">
        <form className="admin-form" onSubmit={saveEdit}>
          <div className="admin-form-field"><label htmlFor="admin-edit-video-title">Title</label><Input id="admin-edit-video-title" maxLength={300} required value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} /></div>
          <div className="admin-form-field"><label htmlFor="admin-edit-video-description">Description</label><Textarea id="admin-edit-video-description" maxLength={5000} rows={4} value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} /></div>
          <div className="admin-form-grid"><div className="admin-form-field"><label htmlFor="admin-edit-video-status">Visibility</label><Select value={editForm.status} onValueChange={(value) => setEditForm((current) => ({ ...current, status: value, isFeatured: value === "inactive" ? false : current.isFeatured }))}><SelectTrigger id="admin-edit-video-status" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active · Public</SelectItem><SelectItem value="inactive">Inactive · Hidden</SelectItem></SelectContent></Select></div><div className="admin-form-field"><label htmlFor="admin-edit-video-order">Popular songs position</label><Input id="admin-edit-video-order" type="number" min="0" max="100000" value={editForm.displayOrder} onChange={(event) => setEditForm((current) => ({ ...current, displayOrder: event.target.value === "" ? 0 : Number(event.target.value) }))} /></div></div>
          <label className={`admin-checkbox-row${editForm.status === "inactive" ? " is-disabled" : ""}`}><input type="checkbox" checked={editForm.isFeatured} disabled={editForm.status === "inactive"} onChange={(event) => setEditForm((current) => ({ ...current, isFeatured: event.target.checked }))} /><span className="admin-checkbox-row__box"><Star size={13} fill="currentColor" /></span><span><strong>Feature on the homepage</strong><small>Show this video in Popular songs.</small></span></label>
          <div className="admin-form-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => setEditing(null)} disabled={editBusy}>Cancel</button><button type="submit" className="admin-button admin-button--primary" disabled={editBusy || !editForm.title.trim()}>{editBusy ? <><LoaderCircle size={15} className="is-spinning" /> Saving…</> : <><Pencil size={15} /> Save changes</>}</button></div>
        </form>
      </Dialog>
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !statusBusyId) setDeleteTarget(null); }} title="Delete video?" description="This permanently removes the video from the admin library. The original YouTube video will not be deleted." className="admin-confirm-dialog">
        <div className="admin-confirm-target"><span className="admin-confirm-target__icon"><CircleAlert size={18} /></span><span><strong>{deleteTarget?.title}</strong><small>{deleteTarget?.source === "playlist" ? "A playlist refresh may add this video again if it remains public." : "This action cannot be undone."}</small></span></div>
        <div className="admin-form-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => setDeleteTarget(null)} disabled={Boolean(statusBusyId)}>Cancel</button><button type="button" className="admin-button admin-button--danger" onClick={confirmDelete} disabled={Boolean(statusBusyId)}>{statusBusyId ? <LoaderCircle size={15} className="is-spinning" /> : <Trash2 size={15} />} Delete video</button></div>
      </Dialog>
    </div>
  );
}
