"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Ellipsis, ExternalLink } from "lucide-react";

export function PlaylistActionMenu({ playlist, onEdit, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const menuId = useId().replace(/:/g, "");

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const gap = 5;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const fitsBelow = viewportHeight - rect.bottom - gap - margin >= height;
    const top = fitsBelow || rect.top < height + gap + margin
      ? Math.min(rect.bottom + gap, viewportHeight - height - margin)
      : rect.top - height - gap;
    const left = Math.max(margin, Math.min(rect.right - width, viewportWidth - width - margin));
    const nextPosition = { top: Math.max(margin, top), left };
    setPosition((current) => current.top === nextPosition.top && current.left === nextPosition.left ? current : nextPosition);
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector("[role='menuitem']")?.focus();
    });
    const onOutsidePointer = (event) => {
      if (!triggerRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [close, open, updatePosition]);

  function onMenuKeyDown(event) {
    const items = [...(panelRef.current?.querySelectorAll("[role='menuitem']") || [])];
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = null;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1 + items.length) % items.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== null && items.length) {
      event.preventDefault();
      items[nextIndex].focus();
    }
    if (event.key === "Tab") close();
  }

  const run = (action) => {
    close();
    action();
  };

  const menu = open && typeof document !== "undefined" ? createPortal(
    <div
      ref={panelRef}
      id={menuId}
      className="admin-action-menu__panel admin-action-menu__panel--portal"
      role="menu"
      aria-label={`Actions for ${playlist.title}`}
      onKeyDown={onMenuKeyDown}
      style={{ top: position.top, left: position.left, position: "fixed", zIndex: 1000 }}
    >
      <button type="button" role="menuitem" onClick={() => run(onEdit)}>Edit playlist</button>
      <button type="button" role="menuitem" onClick={() => run(onStatusChange)}>{playlist.status === "active" ? "Deactivate" : "Activate"}</button>
      <a role="menuitem" href={playlist.playlistUrl} target="_blank" rel="noreferrer">Open on YouTube <ExternalLink size={13} /></a>
      <button type="button" role="menuitem" className="is-danger" onClick={() => run(onDelete)}>Delete playlist</button>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="admin-action-menu">
      <button
        ref={triggerRef}
        type="button"
        className="admin-action-menu__trigger"
        aria-label={`More actions for ${playlist.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      ><Ellipsis size={17} /></button>
      {menu}
    </div>
  );
}
