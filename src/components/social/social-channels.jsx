"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { SocialBrandIcon } from "@/components/icons/social-brand-icon";
import { apiRequest } from "@/lib/api/client";
import { SOCIAL_CHANNELS } from "@/lib/social-links";

function formatAudience(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function AnimatedAudience({ value, loading }) {
  const initialValue = loading ? 1 : Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const displayRef = useRef(initialValue);

  useEffect(() => {
    const target = loading ? 10000000000 : Number(value);
    if (!Number.isFinite(target)) return undefined;

    const startValue = displayRef.current;
    const duration = loading ? 850 : 650;
    const startedAt = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      const nextValue = Math.round(startValue + ((target - startValue) * eased));
      displayRef.current = nextValue;
      setDisplayValue(nextValue);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loading, value]);

  return formatAudience(displayValue);
}

export function SocialChannels({ variant = "cards" }) {
  const [links, setLinks] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/api/social-links", { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setLinks(result.data || {}); })
      .catch(() => { if (!controller.signal.aborted) setLinks({}); });
    return () => controller.abort();
  }, []);

  const channels = SOCIAL_CHANNELS.flatMap((channel) => {
    const profile = links?.[channel.key];
    return profile?.url ? [{ ...channel, ...profile }] : [];
  });

  if (variant === "hero") {
    if (links !== null && !channels.length) return null;
    const heroChannels = links === null
      ? SOCIAL_CHANNELS.slice(0, 4).map((channel) => ({ ...channel, url: null, followers: null, loading: true }))
      : channels.slice(0, 4);
    return <div className="hero-social" aria-label="Follow Zaheer Lohar">
      <span className="hero-social__label">Follow the music</span>
      <div className="hero-social__links">
        {heroChannels.map((channel) => <a key={channel.key} href={channel.url || "/follow"} target={channel.url ? "_blank" : undefined} rel={channel.url ? "noopener noreferrer" : undefined} data-platform={channel.key} aria-label={`Follow Zaheer on ${channel.label}`}>
          <SocialBrandIcon platform={channel.key} size={16} />
          <span>{channel.loading || (channel.followers !== null && channel.followers !== undefined) ? <><strong><AnimatedAudience value={channel.followers} loading={channel.loading} /></strong><small>{channel.countLabel.toLowerCase()}</small></> : <strong>{channel.label}</strong>}</span>
        </a>)}
        <Link href="/follow" className="hero-social__all">All channels <ArrowUpRight size={13} /></Link>
      </div>
    </div>;
  }

  if (variant === "footer") {
    return <div className="footer-social-links" aria-label="Official social channels">
      {channels.map((channel) => <a key={channel.key} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`Open Zaheer Lohar on ${channel.label}`} title={channel.label} data-platform={channel.key}><SocialBrandIcon platform={channel.key} size={17} /></a>)}
    </div>;
  }

  if (links === null) {
    return <div className="social-channel-grid" aria-busy="true" aria-label="Loading social channels">{[0, 1, 2, 3].map((item) => <div className="social-channel-skeleton" key={item} />)}</div>;
  }

  if (!channels.length) {
    return <div className="social-channel-empty"><span><Users size={20} /></span><strong>Official profiles are being updated.</strong><p>Please check back for verified ways to follow along.</p></div>;
  }

  return <div className="social-channel-grid">
    {channels.map((channel) => <article className="social-channel-card" key={channel.key}>
      <div className="social-channel-card__top"><span className="social-channel-card__brand" data-platform={channel.key}><SocialBrandIcon platform={channel.key} size={24} /></span><span className="social-channel-card__label">Official channel</span></div>
      <h2>{channel.label}</h2>
      <p>{channel.description}</p>
      {channel.followers !== null && channel.followers !== undefined ? <div className="social-channel-card__audience"><strong>{formatAudience(channel.followers)}</strong><span>{channel.countLabel.toLowerCase()}</span></div> : <div className="social-channel-card__audience social-channel-card__audience--empty"><span>Find Zaheer on {channel.label}</span></div>}
      <a href={channel.url} target="_blank" rel="noopener noreferrer">Follow on {channel.label}<ArrowUpRight size={15} /></a>
    </article>)}
  </div>;
}

export function SocialFooterCallout() {
  return <div className="footer-social"><span>Stay close to the music</span><SocialChannels variant="footer" /><Link href="/follow">All channels <ArrowUpRight size={12} /></Link></div>;
}
