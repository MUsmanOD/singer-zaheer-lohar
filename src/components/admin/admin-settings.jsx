"use client";

import { Activity, Check, CircleAlert, Database, Globe2, LoaderCircle, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { SocialBrandIcon } from "@/components/icons/social-brand-icon";
import { DEFAULT_SOCIAL_LINKS, SOCIAL_CHANNELS } from "@/lib/social-links";
import { useCallback, useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToast } from "@/components/admin/admin-toast";

const DEFAULTS = { playlistPageTitle: "Playlists", playlistPageDescription: "Explore curated playlists, live performances, interviews, concerts, and the songs behind the moments.", defaultPlaylistLimit: 12, socialLinks: DEFAULT_SOCIAL_LINKS };

function IntegrationCard({ icon: Icon, title, description, configured, configuredLabel, missingLabel }) {
  return <article className="admin-integration-card"><span className="admin-integration-card__icon"><Icon size={18} /></span><div className="admin-integration-card__copy"><strong>{title}</strong><span>{description}</span></div><span className={`admin-integration-state${configured ? " is-ready" : " is-missing"}`}><i />{configured ? configuredLabel : missingLabel}</span></article>;
}

export function AdminSettings() {
  const toast = useAdminToast();
  const [form, setForm] = useState(DEFAULTS);
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminSettings();
      setForm({
        playlistPageTitle: result.data.playlistPageTitle,
        playlistPageDescription: result.data.playlistPageDescription,
        defaultPlaylistLimit: result.data.defaultPlaylistLimit,
        socialLinks: { ...DEFAULT_SOCIAL_LINKS, ...(result.data.socialLinks || {}) },
      });
      setIntegrations(result.data.integrations);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updateAdminSettings(form);
      setForm({ playlistPageTitle: result.data.playlistPageTitle, playlistPageDescription: result.data.playlistPageDescription, defaultPlaylistLimit: result.data.defaultPlaylistLimit, socialLinks: { ...DEFAULT_SOCIAL_LINKS, ...(result.data.socialLinks || {}) } });
      toast(result.message || "Settings saved.");
    } catch (reason) {
      toast(reason.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function updateSocialLink(platform, field, value) {
    setForm((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [platform]: { ...current.socialLinks[platform], [field]: field === "followers" ? (value === "" ? null : Number(value)) : value },
      },
    }));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Workspace configuration</p><h1>Settings</h1><p>Manage official social profiles and review service connections.</p></div></div>
      {error ? <div className="admin-inline-error" role="alert"><CircleAlert size={17} /><span>{error}</span><button className="admin-button admin-button--secondary" type="button" onClick={load}>Try again</button></div> : null}
      <div className="admin-settings-layout">
        <form className="admin-settings-main" onSubmit={save}>
          <section className="admin-panel admin-settings-panel admin-social-settings-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Official profiles</p><h2>Social channels</h2></div><Globe2 size={18} className="admin-panel-heading__icon" /></div><p className="admin-panel-intro">Manage the profile URLs and audience counts shown in the home hero, community section, Follow page, and footer. Counts are maintained here and are not fetched automatically.</p>
            {loading ? <div className="admin-settings-skeleton"><span /><span /><span /></div> : <div className="admin-social-settings-grid">{SOCIAL_CHANNELS.map((channel) => {
              const values = form.socialLinks[channel.key] || DEFAULT_SOCIAL_LINKS[channel.key];
              return <fieldset className="admin-social-setting" key={channel.key}><legend><SocialBrandIcon platform={channel.key} size={17} /><span>{channel.label}</span></legend><div className="admin-form-field"><label htmlFor={`social-${channel.key}-url`}>Profile URL</label><Input id={`social-${channel.key}-url`} type="url" maxLength={300} placeholder={channel.placeholder} value={values.url || ""} onChange={(event) => updateSocialLink(channel.key, "url", event.target.value)} /></div><div className="admin-form-field"><label htmlFor={`social-${channel.key}-followers`}>{channel.countLabel}</label><Input id={`social-${channel.key}-followers`} type="number" min="0" max="1000000000" step="1" placeholder="Optional" value={values.followers ?? ""} onChange={(event) => updateSocialLink(channel.key, "followers", event.target.value)} /></div></fieldset>;
            })}</div>}
            <div className="admin-settings-footer"><span><Check size={14} /> Updates appear across the public site.</span><button className="admin-button admin-button--primary" type="submit" disabled={loading || saving}>{saving ? <><LoaderCircle size={15} className="is-spinning" /> Saving…</> : <><Save size={15} /> Save settings</>}</button></div>
          </section>
        </form>
        <aside className="admin-settings-aside">
          <section className="admin-panel admin-integrations-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Service health</p><h2>Integrations</h2></div><Activity size={17} className="admin-panel-heading__icon" /></div><p className="admin-panel-intro">Credentials stay on the server and are never shown here.</p>
            {integrations ? <div className="admin-integrations-list"><IntegrationCard icon={Database} title="MongoDB" description="Playlist, video, and settings storage" configured={integrations.databaseConfigured} configuredLabel="Connected" missingLabel="Not configured" /><IntegrationCard icon={YouTubeIcon} title="YouTube Data API" description="Playlist metadata and video synchronization" configured={integrations.youtubeConfigured} configuredLabel="Key configured" missingLabel="API key needed" /><IntegrationCard icon={ShieldCheck} title="Admin access" description="Signed, secure dashboard sessions" configured={integrations.authConfigured} configuredLabel="Protected" missingLabel="Setup required" /></div> : <div className="admin-settings-skeleton"><span /><span /><span /></div>}
          </section>
          <section className="admin-panel admin-security-note"><span><LockKeyhole size={17} /></span><div><strong>Security is managed on the server</strong><p>Admin credentials are seeded into MongoDB, while session signing, database access, and rate limits stay in server environment variables. Secret values are not exposed through this dashboard.</p></div></section>
        </aside>
      </div>
    </div>
  );
}
