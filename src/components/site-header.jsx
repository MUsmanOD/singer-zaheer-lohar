"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/music", label: "Music" },
  { href: "/playlists", label: "Playlists" },
  { href: "/promotion", label: "Promotion" },
  { href: "/follow", label: "Follow" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`site-header${isHome ? " site-header--hero" : ""}`}>
      <div className="page-shell site-header__inner">
        <Link className="wordmark" href="/" onClick={closeMenu} aria-label="Zaheer Lohar home">
          <Image className="wordmark__logo" src="/images/logo/logo.png" alt="" width={64} height={64} priority />
          <span className="wordmark__name">Zaheer Lohar</span>
        </Link>

        <Button
          className="mobile-menu-toggle"
          variant="outline"
          size="sm"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </Button>

        <nav
          id="primary-navigation"
          className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((link) => {
            const active = pathname === link.href || (link.href === "/playlists" && pathname.startsWith("/playlists/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            );
          })}
          <Button asChild size="sm" className="site-nav__booking">
            <Link href="/booking" onClick={closeMenu}>Book a show</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
