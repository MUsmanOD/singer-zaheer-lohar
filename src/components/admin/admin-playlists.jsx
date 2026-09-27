"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpDown, ArrowUpRight, Check, CircleAlert, Disc3, LoaderCircle, Plus, RefreshCw, Search, Star } from "lucide-react";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { PlaylistActionMenu } from "@/components/admin/playlist-action-menu";
import { getAdminPlaylists, createAdminPlaylist, updateAdminPlaylist, deleteAdminPlaylist, refreshAdminPlaylist, setAdminPlaylistStatus, setAdminPlaylistFeatured } from "@/lib/api/admin";
import { Dialog } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlaylistImage } from "@/components/playlists/playlist-image";
import { useAdminToast } from "@/components/admin/admin-toast";

const EMPTY_FORM = { playlistUrl: "", title: "", description: "", isFeatured: false, status: "active", displayOrder: 0 };
const SORT_OPTIONS = [{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "order", label: "Display order" }, { value: "title", label: "Title A–Z" }];

function dateLabel(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function AdminPlaylists({ featuredOnly = false }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState(featuredOnly ? "true" : "all");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPlaylists({ page: targetPage, limit: 20, search: query, status, featured, platform, sort });
      setRows(response.data);
      setPagination(response.pagination);
      setPage(targetPage);
    } catch (reason) {
      setRows([]);
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, [featured, platform, query, sort, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(1); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const title = featuredOnly ? "Featured playlists" : "Playlists";
  const description = featuredOnly ? "Choose which active playlists are highlighted across the public library." : "Add, curate, and synchronize the playlists in your public library.";
  const activeFilters = useMemo(() => [status !== "all", featured !== "all" && !featuredOnly, platform !== "all"].filter(Boolean).length, [featured, featuredOnly, platform, status]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(playlist) {
    setEditing(playlist);
    setForm({
      playlistUrl: "",
      title: playlist.titleOverride || "",
      description: playlist.descriptionOverride ?? playlist.description ?? "",
      isFeatured: playlist.isFeatured,
      status: playlist.status,
      displayOrder: playlist.displayOrder,
    });
    setDialogOpen(true);
  }

  function changeField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : name === "displayOrder" ? Number(value) : value }));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        const response = await updateAdminPlaylist(editing.id, { title: form.title, description: form.description, isFeatured: form.isFeatured, status: form.status, displayOrder: form.displayOrder });
        toast(response.message || "Playlist updated.");
      } else {
        const response = await createAdminPlaylist({ playlistUrl: form.playlistUrl, title: form.title, description: form.description, isFeatured: form.isFeatured, status: form.status, displayOrder: form.displayOrder });
        toast(response.message || "Playlist added.");
        if (response.data?.resourceType === "video") {
          setDialogOpen(false);
          router.push("/admin/videos");
          return;
        }
      }
      setDialogOpen(false);
      await load(1);
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function runRowAction(id, action, optimisticValue) {
    setBusyId(id);
    try {
      const response = await action();
      if (optimisticValue !== undefined) {
        setRows((current) => current.map((row) => row.id === id ? { ...row, ...optimisticValue } : row));
      } else await load(page);
      toast(response?.message || "Playlist updated.");
      setDeleteTarget(null);
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setBusyId("");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await runRowAction(deleteTarget.id, () => deleteAdminPlaylist(deleteTarget.id));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Library management</p><h1>{title}</h1><p>{description}</p></div>{!featuredOnly ? <button className="admin-button admin-button--primary" type="button" onClick={openCreate}><Plus size={16} /> Add playlist</button> : null}</div>

      <section className="admin-panel admin-playlists-panel">
        <div className="admin-list-toolbar"><label className="admin-search"><Search size={16} /><span className="sr-only">Search playlists</span><Input type="search" placeholder="Search playlists…" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="admin-filter-row"><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger aria-label="Filter by status" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            {!featuredOnly ? <Select value={featured} onValueChange={(value) => { setFeatured(value); setPage(1); }}><SelectTrigger aria-label="Filter by featured state" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Featured &amp; regular</SelectItem><SelectItem value="true">Featured only</SelectItem><SelectItem value="false">Not featured</SelectItem></SelectContent></Select> : null}
            <Select value={platform} onValueChange={(value) => { setPlatform(value); setPage(1); }}><SelectTrigger aria-label="Filter by platform" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All platforms</SelectItem><SelectItem value="youtube">YouTube</SelectItem></SelectContent></Select>
            <div className="admin-sort-select"><ArrowUpDown size={14} /><Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}><SelectTrigger aria-label="Sort playlists" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent>{SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
        </div>
        <div className="admin-table-summary"><span>{loading ? "Loading library…" : `${pagination.total} ${pagination.total === 1 ? "playlist" : "playlists"}${activeFilters ? ` · ${activeFilters} ${activeFilters === 1 ? "filter" : "filters"}` : ""}`}</span><button className="admin-text-button" type="button" onClick={() => load(1)} disabled={loading}><RefreshCw size={13} /> Refresh list</button></div>

        {error ? <div className="admin-table-state admin-table-state--error" role="alert"><CircleAlert size={20} /><strong>We couldn’t load playlists</strong><span>{error}</span><button type="button" className="admin-button admin-button--secondary" onClick={() => load(1)}>Try again</button></div> : loading ? <div className="admin-table-loading" aria-label="Loading playlists">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div> : rows.length ? (
          <DataTable><thead><tr><th>Playlist</th><th>Platform</th><th>Videos</th><th>Status</th><th>Featured</th><th>Order</th><th>Added</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {rows.map((playlist) => <tr key={playlist.id}>
              <td><div className="admin-playlist-cell"><span className="admin-playlist-cell__cover"><PlaylistImage src={playlist.thumbnail} alt="" sizes="76px" /></span><span className="admin-playlist-cell__copy"><Link href={playlist.status === "active" ? `/playlists/${encodeURIComponent(playlist.slug)}` : playlist.playlistUrl} target="_blank">{playlist.title}<ArrowUpRight size={12} /></Link><small>{playlist.externalPlaylistId}</small></span></div></td>
              <td><span className="admin-platform"><YouTubeIcon size={14} /> YouTube</span></td><td>{playlist.videoCount}</td>
              <td><span className={`admin-status-pill admin-status-pill--${playlist.status}`}><i />{playlist.status}</span></td>
              <td><button type="button" className={`admin-feature-toggle${playlist.isFeatured ? " is-featured" : ""}`} disabled={busyId === playlist.id || playlist.status !== "active"} aria-label={playlist.isFeatured ? `Remove ${playlist.title} from featured` : `Feature ${playlist.title}`} title={playlist.status === "inactive" ? "Activate this playlist to feature it" : playlist.isFeatured ? "Remove from featured" : "Feature playlist"} onClick={() => runRowAction(playlist.id, () => setAdminPlaylistFeatured(playlist.id, !playlist.isFeatured), featuredOnly ? undefined : { isFeatured: !playlist.isFeatured })}><Star size={16} fill={playlist.isFeatured ? "currentColor" : "none"} /></button></td>
              <td><span className="admin-order-value">{playlist.displayOrder}</span></td><td className="admin-date-cell">{dateLabel(playlist.createdAt)}</td><td className="admin-date-cell">{dateLabel(playlist.updatedAt)}</td>
              <td><div className="admin-row-actions"><button type="button" className="admin-icon-action" aria-label={`Refresh ${playlist.title}`} title="Refresh from YouTube" disabled={busyId === playlist.id} onClick={() => runRowAction(playlist.id, () => refreshAdminPlaylist(playlist.id))}>{busyId === playlist.id ? <LoaderCircle size={15} className="is-spinning" /> : <RefreshCw size={15} />}</button><PlaylistActionMenu playlist={playlist} onEdit={() => openEdit(playlist)} onStatusChange={() => runRowAction(playlist.id, () => setAdminPlaylistStatus(playlist.id, playlist.status === "active" ? "inactive" : "active"))} onDelete={() => setDeleteTarget(playlist)} /></div></td>
            </tr>)}
          </tbody></DataTable>
        ) : <div className="admin-table-state"><span className="admin-table-state__icon"><Disc3 size={22} /></span><strong>{query || activeFilters ? "No playlists found" : featuredOnly ? "No featured playlists yet" : "Your playlist library is empty"}</strong><span>{query || activeFilters ? "Try adjusting your search or filters." : featuredOnly ? "Feature an active playlist to highlight it on the public page." : "Add a YouTube playlist and it will appear on your public page."}</span>{!query && !featuredOnly ? <button className="admin-button admin-button--primary" type="button" onClick={openCreate}><Plus size={15} /> Add your first playlist</button> : null}</div>}

        {!error && pagination.totalPages > 1 ? <div className="admin-pagination"><span>Page {pagination.page} of {pagination.totalPages}</span><div><button type="button" className="admin-pagination__button" disabled={loading || page <= 1} onClick={() => load(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button><button type="button" className="admin-pagination__button" disabled={loading || page >= pagination.totalPages} onClick={() => load(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button></div></div> : null}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit playlist" : "Add a playlist"} description={editing ? "Update how this playlist appears in your library." : "Paste a public YouTube playlist link. Its title, cover, and videos will sync automatically."} className="admin-playlist-dialog">
        <form className="admin-form" onSubmit={save}>
          {!editing ? <div className="admin-form-field"><label htmlFor="playlist-url">YouTube video or playlist URL <span>*</span></label><Input id="playlist-url" type="url" name="playlistUrl" autoFocus required maxLength={2048} placeholder="Paste a YouTube video or playlist link" value={form.playlistUrl} onChange={changeField} /><small>We detect the link type automatically. Video URLs are added to Videos, while playlist URLs are synchronized here.</small></div> : null}
          <div className="admin-form-field"><label htmlFor="playlist-title">Custom title <span className="admin-optional">Optional</span></label><Input id="playlist-title" name="title" maxLength={120} placeholder={editing?.externalTitle || "Use the YouTube title"} value={form.title} onChange={changeField} /><small>Leave blank to use the synchronized YouTube title.</small></div>
          <div className="admin-form-field"><label htmlFor="playlist-description">Description <span className="admin-optional">Optional</span></label><Textarea id="playlist-description" name="description" maxLength={1000} rows={3} placeholder="Add a short description for listeners…" value={form.description} onChange={changeField} /></div>
          <div className="admin-form-grid"><div className="admin-form-field"><label htmlFor="playlist-status">Visibility</label><Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value, isFeatured: value === "inactive" ? false : current.isFeatured }))}><SelectTrigger id="playlist-status" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active · Public</SelectItem><SelectItem value="inactive">Inactive · Hidden</SelectItem></SelectContent></Select></div><div className="admin-form-field"><label htmlFor="playlist-order">Display order</label><Input id="playlist-order" name="displayOrder" type="number" min="0" max="100000" value={form.displayOrder} onChange={changeField} /></div></div>
          <label className={`admin-checkbox-row${form.status === "inactive" ? " is-disabled" : ""}`}><input type="checkbox" name="isFeatured" checked={form.isFeatured} disabled={form.status === "inactive"} onChange={changeField} /><span className="admin-checkbox-row__box"><Check size={13} /></span><span><strong>Feature this playlist</strong><small>Give it a prominent place on the public page.</small></span></label>
          <div className="admin-form-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => setDialogOpen(false)} disabled={busy}>Cancel</button><button type="submit" className="admin-button admin-button--primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="is-spinning" /> {editing ? "Saving…" : "Syncing playlist…"}</> : <>{editing ? "Save changes" : "Add playlist"}<ArrowRight size={15} /></>}</button></div>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} title="Delete playlist?" description="This removes the playlist and its synchronized videos from your library. This can’t be undone." className="admin-confirm-dialog">
        <div className="admin-confirm-target"><span className="admin-confirm-target__icon"><CircleAlert size={18} /></span><span><strong>{deleteTarget?.title}</strong><small>The original YouTube playlist will not be deleted.</small></span></div>
        <div className="admin-form-actions"><button type="button" className="admin-button admin-button--secondary" onClick={() => setDeleteTarget(null)} disabled={busyId === deleteTarget?.id}>Cancel</button><button type="button" className="admin-button admin-button--danger" onClick={confirmDelete} disabled={busyId === deleteTarget?.id}>{busyId === deleteTarget?.id ? <LoaderCircle size={15} className="is-spinning" /> : null}Delete playlist</button></div>
      </Dialog>
    </div>
  );
}
