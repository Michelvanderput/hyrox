"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { joinTeamByCodeAction } from "@/app/actions/team";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { writeActiveTeamId } from "@/lib/sync/workspace-storage";

export type TeamPreview = {
  team_id: string;
  team_name: string;
  race_date: string;
  race_location: string;
  division: string;
};

export function InviteJoinPanel({
  code,
  preview,
}: {
  code: string;
  preview: TeamPreview | null;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = isSupabaseConfigured() ? createSupabaseBrowserClient() : null;

  const onJoin = () => {
    setMsg(null);
    startTransition(async () => {
      if (!supabase) {
        setMsg("Supabase is niet geconfigureerd.");
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMsg("Log eerst in om je bij dit team te voegen.");
        return;
      }
      const res = await joinTeamByCodeAction(code);
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      writeActiveTeamId(res.data.teamId);
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
      setMsg("Je zit nu in het team. Open het dashboard of profiel om je duo te zien.");
    });
  };

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted">
        Configureer Supabase om teams te joinen. Zie <code className="text-gold">.env.example</code>.
      </p>
    );
  }

  if (!preview) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Geen team gevonden voor code{" "}
          <span className="font-mono text-gold">{code}</span>. Controleer de link of vraag je
          partner om een nieuwe uitnodiging.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold hover:border-gold/40"
        >
          Naar login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <dl className="grid gap-2 rounded-2xl border border-edge bg-canvas p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Team</dt>
          <dd className="font-semibold text-ink">{preview.team_name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Race datum</dt>
          <dd className="text-ink">{preview.race_date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Locatie</dt>
          <dd className="text-ink">{preview.race_location}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Divisie</dt>
          <dd className="text-ink">{preview.division}</dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={pending}
        onClick={onJoin}
        className="w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
      >
        {pending ? "Bezig…" : "Join dit team"}
      </button>

      {msg && <p className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
