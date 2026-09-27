"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CirclePlay, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { createAdminVideo } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminVideoForm() {
  const router = useRouter();
  const toast = useAdminToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createAdminVideo({ videoUrl, isFeatured: status === "inactive" ? false : isFeatured, status, displayOrder: displayOrder === "" ? 0 : displayOrder });
      toast(isFeatured ? "Video added to Popular songs and your library." : response.message || "Video added to your library.");
      router.push(response.data?.resourceType === "playlist" ? "/admin/playlists" : "/admin/videos");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading admin-video-create-heading">
        <div>
          <Link className="admin-back-link" href="/admin/videos"><ArrowLeft size={14} /> Back to videos</Link>
          <p className="admin-eyebrow">Curate your library</p>
          <h1>Add a video</h1>
          <p>Bring in a YouTube video by link. Its title, artwork, and duration will be filled in automatically.</p>
        </div>
      </div>

      <div className="admin-video-create-layout">
        <section className="admin-panel admin-video-create-panel" aria-labelledby="admin-video-form-title">
          <div className="admin-video-create-panel__heading">
            <span><YouTubeIcon size={19} /></span>
            <div><h2 id="admin-video-form-title">Video details</h2><p>Only public YouTube videos can be added.</p></div>
          </div>
          <form className="admin-form" onSubmit={submit}>
            <div className="admin-form-field">
              <label htmlFor="admin-video-url">YouTube video link <span>*</span></label>
              <Input id="admin-video-url" type="url" autoFocus required maxLength={2048} placeholder="https://www.youtube.com/watch?v=…" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} />
              <small>Video links are added to Videos. Playlist links are detected and sent to Playlists automatically.</small>
            </div>

            <div className="admin-form-grid admin-video-order-grid">
              <div className="admin-form-field">
                <label htmlFor="admin-video-order">Popular songs position</label>
                <Input id="admin-video-order" type="number" min="0" max="100000" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value === "" ? "" : Number(event.target.value))} />
                <small>Lower numbers appear first.</small>
              </div>
              <div className="admin-form-field">
                <label htmlFor="admin-video-status">Visibility</label>
                <Select value={status} onValueChange={(value) => { setStatus(value); if (value === "inactive") setIsFeatured(false); }}><SelectTrigger id="admin-video-status" className="admin-select-trigger"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active · Public</SelectItem><SelectItem value="inactive">Inactive · Hidden</SelectItem></SelectContent></Select>
              </div>
            </div>

            <label className={`admin-checkbox-row${status === "inactive" ? " is-disabled" : ""}`}>
              <input type="checkbox" checked={isFeatured} disabled={status === "inactive"} onChange={(event) => setIsFeatured(event.target.checked)} />
              <span className="admin-checkbox-row__box"><Check size={13} /></span>
              <span><strong>Feature on the homepage</strong><small>Show this song in the Popular songs section.</small></span>
            </label>

            <div className="admin-video-create-note"><ShieldCheck size={16} /><span>We verify the link and fetch video details directly from YouTube. Video files stay on YouTube.</span></div>
            <div className="admin-form-actions">
              <Link className="admin-button admin-button--secondary" href="/admin/videos">Cancel</Link>
              <button type="submit" className="admin-button admin-button--primary" disabled={saving || !videoUrl.trim()}>{saving ? <><LoaderCircle size={15} className="is-spinning" /> Adding video…</> : <>Add video <ArrowRight size={15} /></>}</button>
            </div>
          </form>
        </section>

        <aside className="admin-video-create-aside">
          <div className="admin-video-preview-card">
            <div className="admin-video-preview-card__art"><span><CirclePlay size={29} /></span></div>
            <div className="admin-video-preview-card__copy"><span className="admin-eyebrow">Homepage feature</span><strong>Popular songs</strong><p>Featured videos appear here in the order you choose. Add a few favorites to make this section shine.</p></div>
          </div>
          <p className="admin-video-create-aside__note">Already in a playlist? Use the featured star on the Videos page to add it without creating a duplicate.</p>
        </aside>
      </div>
    </div>
  );
}
