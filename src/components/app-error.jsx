"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export function AppError({ error, reset, admin = false }) {
  void error;
  return (
    <main className={admin ? "admin-page" : "page-shell playlist-detail"}>
      <section className={admin ? "admin-table-state admin-error-state" : "playlist-state playlist-state--error"} role="alert">
        <span className={admin ? "admin-table-state__icon" : "playlist-state__mark"}><span aria-hidden="true">!</span></span>
        <h1>{admin ? "This dashboard page didn’t load" : "This page didn’t load"}</h1>
        <p>{admin ? "The data could not be loaded right now. Your work is safe; try again in a moment." : "Something went wrong while loading this page. Try again or return to the playlist library."}</p>
        <div className="playlist-state__actions"><button type="button" className={admin ? "admin-button admin-button--secondary" : "button-light"} onClick={() => reset()}><RefreshCw size={14} /> Try again</button>{admin ? <Link className="admin-button admin-button--secondary" href="/admin/overview"><ArrowLeft size={14} /> Dashboard overview</Link> : <Link className="button-dark" href="/playlists"><ArrowLeft size={14} /> Playlists</Link>}</div>
      </section>
    </main>
  );
}
