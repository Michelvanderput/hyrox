"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LoginForm() {
  const searchParams = useSearchParams();
  const configured = useMemo(() => isSupabaseConfigured(), []);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"magic" | "password" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const err = searchParams.get("error");

  if (!configured || !supabase) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-edge bg-panel p-6">
        <h1 className="font-heading text-2xl font-black">Login</h1>
        <p className="text-sm text-muted">
          Supabase is nog niet geconfigureerd. Voeg environment variables toe en herstart{" "}
          <code className="rounded bg-canvas px-1 py-0.5 text-xs text-gold">next dev</code>.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            <code className="text-gold">NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code className="text-gold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
        </ul>
        <p className="text-sm text-muted">
          In Supabase Dashboard → Authentication → URL configuration: voeg{" "}
          <code className="text-gold">http://localhost:3000/auth/callback</code> (en je Vercel URL)
          toe bij Redirect URLs.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold hover:border-gold/40"
        >
          ← Terug
        </Link>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const onMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy("magic");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/profile`,
      },
    });
    setBusy(null);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Check je inbox voor de magic link.");
  };

  const onPasswordLogin = async () => {
    setMsg(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setMsg("Vul je e-mailadres in.");
      return;
    }
    if (!password) {
      setMsg("Vul je wachtwoord in, of gebruik de magic link.");
      return;
    }
    setBusy("password");
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    setBusy(null);
    if (error) {
      setMsg(error.message);
      return;
    }
    window.location.assign("/profile");
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-edge bg-panel p-6">
      <h1 className="font-heading text-2xl font-black">Login</h1>
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink/90">Eerste keer:</span> vraag een magic link.{" "}
        <span className="font-semibold text-ink/90">Daarna:</span> op{" "}
        <span className="font-semibold text-ink/90">Profiel</span> kun je een wachtwoord instellen
        en hieronder mee inloggen. Op Profiel start je je duo-team — daar zie je de teamcode. Je
        partner opent bijvoorbeeld{" "}
        <code className="rounded bg-canvas px-1 py-0.5 text-xs text-gold">/invite/teamcode</code>{" "}
        (met jullie echte code).
      </p>

      {err && (
        <p className="rounded-xl border border-race/30 bg-race/10 px-3 py-2 text-sm text-race">
          {decodeURIComponent(err)}
        </p>
      )}

      <form onSubmit={onMagicLink} className="space-y-3">
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          E-mail
          <input
            required
            type="email"
            autoComplete="email"
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
          />
        </label>
        <button
          type="submit"
          disabled={busy !== null}
          className="w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
        >
          {busy === "magic" ? "Versturen…" : "Stuur magic link (eerste keer)"}
        </button>
      </form>

      <div className="relative py-2 text-center text-[11px] text-faint">
        <span className="relative z-10 bg-panel px-2">of</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-edge" />
      </div>

      <div className="space-y-3">
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Wachtwoord (als je die op Profiel hebt ingesteld)
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void onPasswordLogin()}
          className="w-full min-h-11 rounded-xl border border-edge-hover bg-canvas text-sm font-semibold hover:border-gold/40 disabled:opacity-50"
        >
          {busy === "password" ? "Inloggen…" : "Inloggen met wachtwoord"}
        </button>
      </div>

      {msg && <p className="text-sm text-muted">{msg}</p>}

      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold hover:border-gold/40"
      >
        ← Terug naar dashboard
      </Link>
    </div>
  );
}
