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
          magic link / Google te gebruiken.
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

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Account</h2>
      <p className="mt-2 truncate text-sm text-ink">
        Ingelogd als <span className="font-semibold">{session.user.email}</span>
      </p>
      <button
        type="button"
        className="mt-3 min-h-11 w-full rounded-xl border border-edge-hover bg-canvas text-sm font-semibold text-muted hover:text-race"
        onClick={() => void supabase.auth.signOut()}
      >
        Uitloggen
      </button>
    </section>
  );
}
