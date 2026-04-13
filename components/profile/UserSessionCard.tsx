"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function UserSessionCard() {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [ready, setReady] = useState(() => !configured || !supabase);
  const [session, setSession] = useState<Session | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!configured || !supabase) {
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [configured, supabase]);

  if (!configured || !supabase) {
    return (
      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Account</h2>
        <p className="mt-2 text-sm text-muted">
          Cloud login is uit. Zet Supabase keys in <code className="text-gold">.env.local</code> om
          magic link / wachtwoord te gebruiken.
        </p>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <p className="text-sm text-muted">Sessie laden…</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Account</h2>
        <p className="mt-2 text-sm text-muted">Je bent niet ingelogd.</p>
        <Link
          href="/login"
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-4 text-sm font-bold text-canvas"
        >
          Login
        </Link>
      </section>
    );
  }

  const onSavePassword = async () => {
    setPwMsg(null);
    if (newPassword.length < 6) {
      setPwMsg("Wachtwoord moet minstens 6 tekens zijn.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg("Wachtwoorden komen niet overeen.");
      return;
    }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwBusy(false);
    if (error) {
      setPwMsg(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPwMsg("Wachtwoord opgeslagen. Je kunt nu ook op /login met e-mail + wachtwoord inloggen.");
  };

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Account</h2>
      <p className="mt-2 truncate text-sm text-ink">
        Ingelogd als <span className="font-semibold">{session.user.email}</span>
      </p>

      <div className="mt-4 border-t border-edge pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Inlogwachtwoord</h3>
        <p className="mt-1 text-xs text-muted">
          Na je eerste magic link kun je hier een wachtwoord zetten voor sneller inloggen op /login.
        </p>
        <label className="mt-2 block space-y-1 text-xs font-semibold text-muted">
          Nieuw wachtwoord
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full min-h-10 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="mt-2 block space-y-1 text-xs font-semibold text-muted">
          Bevestigen
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full min-h-10 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={pwBusy}
          className="mt-2 w-full min-h-10 rounded-xl border border-edge-hover bg-canvas text-sm font-semibold hover:border-gold/40 disabled:opacity-50"
          onClick={() => void onSavePassword()}
        >
          {pwBusy ? "Opslaan…" : "Wachtwoord opslaan"}
        </button>
        {pwMsg && <p className="mt-2 text-xs text-muted">{pwMsg}</p>}
      </div>

      <button
        type="button"
        className="mt-4 min-h-11 w-full rounded-xl border border-edge-hover bg-canvas text-sm font-semibold text-muted hover:text-race"
        onClick={() => void supabase.auth.signOut()}
      >
        Uitloggen
      </button>
    </section>
  );
}
