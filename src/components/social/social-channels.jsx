"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { SocialBrandIcon } from "@/components/icons/social-brand-icon";
import { apiRequest } from "@/lib/api/client";
import { SOCIAL_CHANNELS } from "@/lib/social-links";

function formatAudience(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function AnimatedAudience({ value, loading, animate = false }) {
  const initialValue = loading ? 1 : animate ? 0 : Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const displayRef = useRef(initialValue);

  useEffect(() => {
    let frame;
    let cancelled = false;

    if (loading) {
      const startedAt = performance.now();

      const tickLoading = (now) => {
        const nextValue = Math.max(1, Math.floor((now - startedAt) / 90) + 1);
        if (nextValue !== displayRef.current) {
          displayRef.current = nextValue;
          setDisplayValue(nextValue);
        }

        if (!cancelled) frame = requestAnimationFrame(tickLoading);
      };

      frame = requestAnimationFrame(tickLoading);
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    const target = Number(value);
    if (!Number.isFinite(target)) return undefined;

    const startValue = displayRef.current;
    const duration = 650;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      const nextValue = Math.round(startValue + ((target - startValue) * eased));
      displayRef.current = nextValue;
      setDisplayValue(nextValue);
      if (progress < 1 && !cancelled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [loading, value]);

  return loading ? String(displayValue) : formatAudience(displayValue);
}

export function SocialChannels({ variant = "cards", autoScroll = false, animateCounts = false }) {
  const [links, setLinks] = useState(null);
  const [cardOrder, setCardOrder] = useState([]);
  const gridRef = useRef(null);
  const cardOrderRef = useRef([]);

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
  const channelCount = channels.length;
  const channelSignature = channels.map((channel) => channel.key).join("|");

  useEffect(() => {
    const keys = channelSignature ? channelSignature.split("|") : [];
    const current = cardOrderRef.current;
    const next = [...current.filter((key) => keys.includes(key)), ...keys.filter((key) => !current.includes(key))];
    cardOrderRef.current = next;
    setCardOrder((previous) => previous.length === next.length && previous.every((key, index) => key === next[index]) ? previous : next);
  }, [channelSignature]);

  useEffect(() => {
    if (variant !== "cards" || !autoScroll || links === null || channelCount < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let grid;
    let interval;
    let resumeTimer;
    let readyTimer;
    let animationFrame;
    let paused = false;
    let disposed = false;
    let ready = false;
    let eventsBound = false;
    let measureAttempts = 0;
    let originalScrollBehavior = "smooth";
    let originalScrollSnapType = "x proximity";

    const getStep = () => {
      const firstCard = grid.firstElementChild;
      if (!firstCard) return grid.clientWidth;
      const gap = Number.parseFloat(window.getComputedStyle(grid).columnGap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const restoreScrollStyles = () => {
      if (!grid) return;
      grid.style.scrollBehavior = originalScrollBehavior;
      grid.style.scrollSnapType = originalScrollSnapType;
    };

    const rotateCards = () => {
      if (disposed || paused) return;
      const latestOrder = cardOrderRef.current;
      if (latestOrder.length < 2) return;
      const nextOrder = [...latestOrder.slice(1), latestOrder[0]];
      cardOrderRef.current = nextOrder;
      grid.scrollLeft = 0;
      flushSync(() => setCardOrder(nextOrder));
      restoreScrollStyles();
    };

    const animateTo = (target) => {
      const start = grid.scrollLeft;
      const distance = target - start;
      if (Math.abs(distance) < 1) {
        rotateCards();
        return;
      }
      const startedAt = performance.now();
      const duration = 900;
      grid.style.scrollBehavior = "auto";
      grid.style.scrollSnapType = "none";

      const tick = (now) => {
        if (disposed || paused) {
          animationFrame = undefined;
          restoreScrollStyles();
          return;
        }
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - ((1 - progress) ** 3);
        grid.scrollLeft = start + (distance * eased);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
          return;
        }
        animationFrame = undefined;
        grid.scrollLeft = target;
        rotateCards();
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const advance = () => {
      if (!grid || paused || grid.scrollWidth <= grid.clientWidth + 1) return;
      const currentOrder = cardOrderRef.current;
      if (currentOrder.length < 2 || animationFrame) return;
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      const nextScroll = grid.scrollLeft + getStep();
      const target = Math.min(nextScroll, maxScroll);
      animateTo(target);
    };

    const start = () => {
      window.clearInterval(interval);
      interval = window.setInterval(advance, 4200);
    };

    const bindGridEvents = () => {
      if (!grid || eventsBound) return;
      eventsBound = true;
      grid.addEventListener("pointerenter", pause);
      grid.addEventListener("pointerleave", resume);
      grid.addEventListener("focusin", pause);
      grid.addEventListener("focusout", resume);
      grid.addEventListener("touchstart", pause, { passive: true });
      grid.addEventListener("wheel", pause, { passive: true });
    };

    const waitForOverflow = () => {
      if (disposed) return;
      grid = gridRef.current;
      if (grid && grid.scrollWidth > grid.clientWidth + 1) {
        const computedStyle = window.getComputedStyle(grid);
        originalScrollBehavior = computedStyle.scrollBehavior;
        originalScrollSnapType = computedStyle.scrollSnapType;
        ready = true;
        bindGridEvents();
        start();
        return;
      }
      if (measureAttempts >= 20) return;
      measureAttempts += 1;
      readyTimer = window.setTimeout(waitForOverflow, 120);
    };

    const pause = () => {
      paused = true;
      window.clearInterval(interval);
      window.clearTimeout(resumeTimer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
        restoreScrollStyles();
      }
      resumeTimer = window.setTimeout(() => {
        paused = false;
        start();
      }, 6500);
    };

    const resume = () => {
      window.clearTimeout(resumeTimer);
      paused = false;
      if (ready) start();
    };

    waitForOverflow();

    return () => {
      disposed = true;
      window.clearTimeout(readyTimer);
      window.clearInterval(interval);
      window.clearTimeout(resumeTimer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (grid) {
        grid.removeEventListener("pointerenter", pause);
        grid.removeEventListener("pointerleave", resume);
        grid.removeEventListener("focusin", pause);
        grid.removeEventListener("focusout", resume);
        grid.removeEventListener("touchstart", pause);
        grid.removeEventListener("wheel", pause);
      }
    };
  }, [autoScroll, channelCount, channelSignature, links, variant]);

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

  const displayedChannels = autoScroll && cardOrder.length === channels.length
    ? cardOrder.map((key) => channels.find((channel) => channel.key === key)).filter(Boolean)
    : channels;

  return <div className="social-channel-grid" ref={gridRef}>
    {displayedChannels.map((channel) => <article className="social-channel-card" data-channel={channel.key} key={channel.key}>
      <div className="social-channel-card__top"><span className="social-channel-card__brand" data-platform={channel.key}><SocialBrandIcon platform={channel.key} size={24} /></span><span className="social-channel-card__label">Official channel</span></div>
      <h2>{channel.label}</h2>
      <p>{channel.description}</p>
      {channel.followers !== null && channel.followers !== undefined ? <div className="social-channel-card__audience"><strong><AnimatedAudience value={channel.followers} animate={animateCounts} /></strong><span>{channel.countLabel.toLowerCase()}</span></div> : <div className="social-channel-card__audience social-channel-card__audience--empty"><span>Find Zaheer on {channel.label}</span></div>}
      <a href={channel.url} target="_blank" rel="noopener noreferrer">Follow on {channel.label}<ArrowUpRight size={15} /></a>
    </article>)}
  </div>;
}

export function SocialFooterCallout() {
  return <div className="footer-social"><span>Stay close to the music</span><SocialChannels variant="footer" /><Link href="/follow">All channels <ArrowUpRight size={12} /></Link></div>;
}
