"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Check, ChevronRight, Megaphone } from "lucide-react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { getAdminNotifications, markAdminNotificationRead } from "@/lib/api/admin";

function timeLabel(value) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function AdminNotifications() {
  const router = useRouter();
  const toast = useAdminToast();
  const root = useRef(null);
  const seenIds = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const result = await getAdminNotifications({ signal: controller.signal });
        const nextItems = result.data.items || [];
        if (seenIds.current) {
          const newItems = nextItems.filter((item) => !seenIds.current.has(item.id));
          newItems.slice(0, 3).forEach((item) => toast(item.type === "promotion.created"
            ? `${item.contactName || "A client"} sent a new promotion inquiry.`
            : `${item.contactName || "A client"} sent a new performance booking.`, "success"));
        }
        seenIds.current = new Set(nextItems.map((item) => item.id));
        setItems(nextItems);
        setUnreadCount(result.data.unreadCount || 0);
      } catch (error) {
        if (error?.name !== "AbortError") { /* The next poll can recover from a temporary failure. */ }
      }
    }
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 30_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, [toast]);

  useEffect(() => {
    if (!open) return undefined;
    function dismiss(event) {
      if (event.type === "keydown" && event.key === "Escape") setOpen(false);
      if (event.type === "pointerdown" && root.current && !root.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);

  async function openNotification(item) {
    const destination = item.promotionId
      ? `/admin/promotions/${encodeURIComponent(item.promotionId)}`
      : item.bookingId ? `/admin/bookings/${encodeURIComponent(item.bookingId)}` : "";
    if (!destination) return;
    setOpen(false);
    if (!item.isRead) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
      setUnreadCount((value) => Math.max(0, value - 1));
      void markAdminNotificationRead(item.id).catch(() => {});
    }
    router.push(destination);
  }

  return <div className="admin-notifications" ref={root}>
    <button type="button" className="admin-notifications__trigger" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <Bell size={17} />{unreadCount > 0 ? <span className="admin-notifications__badge">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
    </button>
    {open ? <section className="admin-notifications__panel" role="dialog" aria-label="Admin notifications">
      <header><div><strong>Notifications</strong><span>{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</span></div><span className="admin-notifications__live"><i /> Live</span></header>
      {items.length ? <ul>{items.map((item) => <li key={item.id} className={!item.isRead ? "is-unread" : ""}>
        <button type="button" onClick={() => openNotification(item)} disabled={!item.bookingId && !item.promotionId}>
          <span className="admin-notifications__icon">{item.type === "promotion.created" ? <Megaphone size={16} /> : <CalendarDays size={16} />}</span>
          <span className="admin-notifications__copy"><strong>{item.title}</strong><small>{item.message}</small><time dateTime={item.createdAt}>{timeLabel(item.createdAt)}</time></span>
          {!item.isRead ? <span className="admin-notifications__unread-dot" aria-label="Unread" /> : <Check size={14} className="admin-notifications__read-icon" />}
        </button>
      </li>)}</ul> : <div className="admin-notifications__empty"><Bell size={18} /><strong>No notifications yet</strong><span>New booking and promotion inquiries will show up here.</span></div>}
      <div className="admin-notifications__footer"><Link href="/admin/bookings" onClick={() => setOpen(false)}>Bookings <ChevronRight size={14} /></Link><Link href="/admin/promotions" onClick={() => setOpen(false)}>Promotions <ChevronRight size={14} /></Link></div>
    </section> : null}
  </div>;
}
