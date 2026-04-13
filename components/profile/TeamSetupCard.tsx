"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { createTeamAction, updateTeamNameAction } from "@/app/actions/team";
import type { TeamSummary } from "@/app/actions/workspace";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { writeActiveTeamId } from "@/lib/sync/workspace-storage";
import { appToast } from "@/lib/toast-store";

function InviteShareBlock({
  inviteCode,
  copied,
  onCopy,
}: {
  inviteCode: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const invitePath = `/invite/${inviteCode}`;
  const fullInviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}${invitePath}` : invitePath;

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-gold/30 bg-gold/5 p-3 text-sm">
      <div>
        <p className="font-semibold text-gold">Uitnodigingscode</p>
        <p className="mt-1 font-mono text-lg font-bold tracking-wide text-ink">{inviteCode}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Link voor partner</p>
        <p className="mt-1 break-all rounded-lg border border-edge bg-canvas px-2 py-1.5 font-mono text-xs text-ink">
          {fullInviteUrl}
        </p>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="mt-2 w-full min-h-10 rounded-xl border border-edge-hover bg-canvas text-xs font-semibold text-ink hover:border-gold/40"
        >
          {copied ? "Gekopieerd!" : "Kopieer link"}
        </button>
      </div>
      <p className="text-[11px] text-muted">Partner logt in en opent deze link.</p>
    </div>
  );
}

function TeamRenameFields({ team }: { team: TeamSummary }) {
  const [value, setValue] = useState(team.name);
  const [pending, startTransition] = useTransition();
  const [localErr, setLocalErr] = useState<string | null>(null);

  const onSave = () => {
    setLocalErr(null);
    startTransition(async () => {
      const res = await updateTeamNameAction(team.id, value);
      if (!res.ok) {
        setLocalErr(res.error);
        appToast.error(res.error);
        return;
      }
      appToast.success("Teamnaam opgeslagen.");
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
    });
  };

  return (
    <div>
      <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
        Teamnaam
        <input
          className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={pending || !value.trim()}
        onClick={onSave}
        className="mt-2 w-full min-h-11 rounded-xl border border-edge-hover bg-canvas text-sm font-semibold text-ink hover:border-gold/40 disabled:opacity-45"
      >
        {pending ? "Opslaan…" : "Teamnaam opslaan"}
      </button>
      {localErr && <p className="mt-2 text-sm text-race">{localErr}</p>}
    </div>
  );
}

export function TeamSetupCard() {
  const supabase = isSupabaseConfigured() ? createSupabaseBrowserClient() : null;
  const { teams, activeTeamId } = useTrainingCloud();

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    const id =
      activeTeamId && teams.some((t) => t.id === activeTeamId) ? activeTeamId : teams[0]!.id;
    return teams.find((t) => t.id === id) ?? null;
  }, [teams, activeTeamId]);

  const [newTeamName, setNewTeamName] = useState("HYROX Duo");

  /** Tot `teams` ververst is na aanmaken. */
  const [optimisticInvite, setOptimisticInvite] = useState<string | null>(null);
  const displayInviteCode = activeTeam?.inviteCode ?? optimisticInvite;

  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingCreate, startCreate] = useTransition();

  const fullInviteUrlForCopy =
    typeof window !== "undefined" && displayInviteCode
      ? `${window.location.origin}/invite/${displayInviteCode}`
      : null;

  const copyInviteUrl = useCallback(async () => {
    if (!fullInviteUrlForCopy) return;
    try {
      await navigator.clipboard.writeText(fullInviteUrlForCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [fullInviteUrlForCopy]);

  const onCreate = () => {
    setErr(null);
    setOptimisticInvite(null);
    setCopied(false);
    startCreate(async () => {
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
      const res = await createTeamAction(newTeamName);
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
      setOptimisticInvite(res.data.inviteCode);
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
    });
  };

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Team</h2>

      {activeTeam ? (
        <>
          <p className="mt-2 text-xs text-muted">
            Deel-link blijft hier staan. Pas de teamnaam aan — die zien jullie in de app en op de
            uitnodiging (na verversen).
          </p>
          {teams.length > 1 ? (
            <p className="mt-2 text-[11px] text-faint">
              Je hebt meerdere teams: wissel het actieve team in de lijst hieronder om de bijbehorende
              uitnodiging te tonen.
            </p>
          ) : null}

          <div className="mt-3" key={`${activeTeam.id}-${activeTeam.name}`}>
            <TeamRenameFields team={activeTeam} />
          </div>

          {displayInviteCode ? (
            <InviteShareBlock inviteCode={displayInviteCode} copied={copied} onCopy={copyInviteUrl} />
          ) : (
            <p className="mt-4 text-sm text-muted">
              Uitnodigingscode laden… even verversen als dit blijft hangen.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-xs text-muted">
            Maak het team en stuur de link naar je partner (ingelogd →{" "}
            <strong>Join dit team</strong>).
          </p>

          <label className="mt-3 block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Teamnaam
            <input
              className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={pendingCreate}
            onClick={onCreate}
            className="mt-3 w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
          >
            {pendingCreate ? "Aanmaken…" : "Nieuw team aanmaken"}
          </button>
          {displayInviteCode ? (
            <InviteShareBlock inviteCode={displayInviteCode} copied={copied} onCopy={copyInviteUrl} />
          ) : null}
        </>
      )}

      {err && <p className="mt-2 text-sm text-race">{err}</p>}
    </section>
  );
}
