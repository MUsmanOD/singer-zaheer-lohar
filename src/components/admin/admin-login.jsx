"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Disc3, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/admin/auth/session").then((result) => {
      if (active && result.data.authenticated) {
        router.replace("/admin/overview");
        router.refresh();
      }
    }).catch(() => {}).finally(() => {
      if (active) setCheckingSession(false);
    });
    return () => { active = false; };
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiRequest("/api/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      router.replace("/admin/overview");
      router.refresh();
    } catch (reason) {
      setError(reason.message);
      setBusy(false);
    }
  }

  if (checkingSession) return <main className="admin-login-page"><p className="admin-login-checking">Checking secure session…</p></main>;

  return (
    <main className="admin-login-page">
      <div className="admin-login-art"><div className="admin-login-art__disc"><span /></div><p>THE MUSIC<br />DESERVES A HOME.</p><span className="admin-login-art__caption">ZAHEER LOHAR · MEDIA STUDIO</span></div>
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <Link href="/" className="admin-login-back"><ArrowLeft size={15} /> Back to website</Link>
        <div className="admin-login-brand"><span><Disc3 size={20} /></span><div><strong>ZAHEER LOHAR</strong><small>MEDIA STUDIO</small></div></div>
        <div className="admin-login-copy"><p className="eyebrow">Private workspace</p><h1 id="admin-login-title">Welcome back.</h1><p>Sign in to manage playlists, videos, and the public music library.</p></div>
        <form className="admin-login-form" onSubmit={submit}>
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <div className="admin-login-form__password-label"><label htmlFor="admin-password">Password</label><LockKeyhole size={14} /></div>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <button type="submit" className="admin-login-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard"}{!busy ? <ArrowRight size={16} /> : null}</button>
        </form>
        <p className="admin-login-secure"><LockKeyhole size={13} /> Protected admin access · Secure session</p>
      </section>
    </main>
  );
}
