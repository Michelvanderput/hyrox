"use client";

import { useCallback, useState, useTransition } from "react";

import { createTeamAction } from "@/app/actions/team";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { writeActiveTeamId } from "@/lib/sync/workspace-storage";

export function TeamSetupCard() {
  const supabase = isSupabaseConfigured() ? createSupabaseBrowserClient() : null;
  const [name, setName] = useState("HYROX Duo");
  const [invite, setInvite] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const invitePath = invite ? `/invite/${invite}` : null;
  const fullInviteUrl =
    typeof window !== "undefined" && invitePath ? `${window.location.origin}${invitePath}` : null;

  const onCreate = () => {
    setErr(null);
    setInvite(null);
    setCopied(false);
    startTransition(async () => {
      if (!supabase) {
        setErr("Supabase is niet geconfigureerd.");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErr("Log eerst in om een team aan te maken.");
        return;
      }
      const res = await createTeamAction(name);
      if (!res.ok) {
        const msg = res.error;
        setErr(
          /recursion|row-level security|rls/i.test(msg)
            ? `${msg} — Voer de nieuwste Supabase-SQL migraties uit (zie .env.example onder SQL), daarna opnieuw proberen.`
            : msg,
        );
        return;
      }
      writeActiveTeamId(res.data.teamId);
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
      setInvite(res.data.inviteCode);
    });
  };

  const copyInviteUrl = useCallback(async () => {
    if (!fullInviteUrl) return;
    try {
      await navigator.clipboard.writeText(fullInviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [fullInviteUrl]);

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Team (cloud)</h2>
      <p className="mt-2 text-sm text-muted">
        Jullie zijn met z’n tweeën één <span className="font-semibold text-ink">duo-team</span> in de
        app: één iemand maakt het team en deelt de link, de ander opent de link (ingelogd) en klikt
        op <span className="font-semibold text-ink">Join</span>.
      </p>

      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs text-muted">
        <li>
          <span className="font-semibold text-ink">Jij (nu):</span> team aanmaken hieronder.
        </li>
        <li>
          <span className="font-semibold text-ink">Partner:</span> inloggen op dezelfde site → jouw
          uitnodigingslink openen → &quot;Join dit team&quot;.
        </li>
        <li>
          Daarna zien jullie elkaar op het dashboard; afvinken gaat per persoon alleen voor eigen
          workouts.
        </li>
      </ol>

      <label className="mt-4 block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
        Teamnaam
        <input
          className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={onCreate}
        className="mt-3 w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
      >
        {pending ? "Aanmaken…" : "Nieuw team aanmaken"}
      </button>
      {err && <p className="mt-2 text-sm text-race">{err}</p>}
      {invite && fullInviteUrl && (
        <div className="mt-4 space-y-3 rounded-2xl border border-gold/30 bg-gold/5 p-3 text-sm">
          <div>
            <p className="font-semibold text-gold">Uitnodigingscode</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wide text-ink">{invite}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Link voor partner</p>
            <p className="mt-1 break-all rounded-lg border border-edge bg-canvas px-2 py-1.5 font-mono text-xs text-ink">
              {fullInviteUrl}
            </p>
            <button
              type="button"
              onClick={() => void copyInviteUrl()}
              className="mt-2 w-full min-h-10 rounded-xl border border-edge-hover bg-canvas text-xs font-semibold text-ink hover:border-gold/40"
            >
              {copied ? "Gekopieerd!" : "Kopieer link"}
            </button>
          </div>
          <p className="text-xs text-muted">
            Stuur deze link via WhatsApp/e-mail. Je partner moet eerst een account hebben (magic
            link of wachtwoord) en daarna de link openen.
          </p>
        </div>
      )}
    </section>
  );
}
