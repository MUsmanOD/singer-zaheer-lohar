"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, Disc3, LayoutDashboard, ListVideo, LogOut, Megaphone, Menu, PanelLeftClose, PanelLeftOpen, Settings2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { AdminToastProvider, useAdminToast } from "@/components/admin/admin-toast";
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { AdminNotifications } from "@/components/admin/admin-notifications";

const navigation = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/playlists", label: "Playlists", icon: Disc3 },
  { href: "/admin/videos", label: "Videos", icon: ListVideo },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/featured", label: "Featured", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

const pageTitles = {
  "/admin": "Overview",
  "/admin/overview": "Overview",
  "/admin/playlists": "Playlists",
  "/admin/videos": "Videos",
  "/admin/videos/new": "Add video",
  "/admin/bookings": "Bookings",
  "/admin/promotions": "Promotions",
  "/admin/promotions/[id]": "Promotion details",
  "/admin/featured": "Featured playlists",
  "/admin/settings": "Settings",
};

function AdminChrome({ email, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useAdminToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    function handleEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/admin/auth/logout", { method: "POST", body: "{}" });
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      toast(error.message, "error");
      setSigningOut(false);
    }
  }

  return (
    <div className={`admin-shell${collapsed ? " admin-shell--collapsed" : ""}`}>
      <button className={`admin-mobile-scrim${mobileOpen ? " is-visible" : ""}`} type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" aria-hidden={!mobileOpen} tabIndex={mobileOpen ? 0 : -1} />
      <aside id="admin-sidebar" className={`admin-sidebar${mobileOpen ? " admin-sidebar--open" : ""}`} aria-label="Admin navigation">
        <Link href="/admin/overview" className="admin-brand" aria-label="Zaheer Lohar Admin overview">
          <span className="admin-brand__mark"><Image src="/images/logo/logo.png" alt="" width={46} height={46} priority /></span>
          <span className="admin-brand__text"><strong>ZAHEER LOHAR</strong><small>MEDIA STUDIO</small></span>
        </Link>
        <div className="admin-sidebar__label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Dashboard">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/admin/overview" && pathname === "/admin") || (href === "/admin/playlists" && pathname.startsWith("/admin/playlists/")) || (href === "/admin/videos" && pathname.startsWith("/admin/videos/")) || (href === "/admin/bookings" && pathname.startsWith("/admin/bookings/")) || (href === "/admin/promotions" && pathname.startsWith("/admin/promotions/"));
            return <Link href={href} key={href} className={`admin-nav__link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>{active ? <span className="admin-nav__indicator" /> : null}
            </Link>;
          })}
        </nav>
        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__youtube"><span><YouTubeIcon size={17} /></span><div><strong>YouTube library</strong><small>Playlist manager</small></div></div>
          <div className="admin-user"><span className="admin-user__avatar">{email?.slice(0, 1).toUpperCase() || "A"}</span><span className="admin-user__name"><strong>Administrator</strong><small>{email}</small></span><button className="admin-signout" type="button" onClick={signOut} disabled={signingOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left"><button type="button" className="admin-menu-toggle" aria-label="Open navigation" aria-controls="admin-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={20} /></button><button type="button" className="admin-collapse-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><span className="admin-topbar__section">Studio</span><span className="admin-topbar__slash">/</span><strong>{pathname.startsWith("/admin/bookings/") ? "Booking details" : pathname.startsWith("/admin/promotions/") ? "Promotion details" : pageTitles[pathname] || "Playlist management"}</strong></div>
          <div className="admin-topbar__right"><AdminNotifications /><Link href="/playlists" target="_blank" className="admin-view-site">View website <ArrowUpRight size={14} /></Link><button type="button" className="admin-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

export function AdminShell({ email, children }) {
  return <AdminToastProvider><AdminChrome email={email}>{children}</AdminChrome></AdminToastProvider>;
}
