"use client";

import { useState, useTransition } from "react";

import { createTeamAction } from "@/app/actions/team";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { writeActiveTeamId } from "@/lib/sync/workspace-storage";

export function TeamSetupCard() {
  const supabase = isSupabaseConfigured() ? createSupabaseBrowserClient() : null;
  const [name, setName] = useState("HYROX Duo");
  const [invite, setInvite] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onCreate = () => {
    setErr(null);
    setInvite(null);
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
        setErr(res.error);
        return;
      }
      writeActiveTeamId(res.data.teamId);
      setInvite(res.data.inviteCode);
    });
  };

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Team (cloud)</h2>
      <p className="mt-2 text-sm text-muted">
        Maak een duo-team aan en deel de invite-link met je partner.
      </p>
      <label className="mt-3 block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
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
      {invite && (
        <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/5 p-3 text-sm">
          <p className="font-semibold text-gold">Invite code</p>
          <p className="mt-1 font-mono text-ink">{invite}</p>
          <p className="mt-2 text-muted">
            Deel met je partner:{" "}
            <span className="break-all font-mono text-ink">/invite/{invite}</span>
          </p>
        </div>
      )}
    </section>
  );
}
