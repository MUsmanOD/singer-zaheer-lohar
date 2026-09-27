"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const payload = JSON.stringify({
      path: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer,
    });
    window.fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
