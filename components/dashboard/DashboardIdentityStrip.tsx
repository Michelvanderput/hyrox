"use client";

import Link from "next/link";

import { resolveMyAthleteIndex } from "@/lib/athlete-ui";
import { useTrackerStore } from "@/lib/store";

export function DashboardIdentityStrip() {
  const viewerUserId = useTrackerStore((s) => s.viewerUserId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const names = useTrackerStore((s) => s.athleteNames);

  const my = resolveMyAthleteIndex(memberUserIds, viewerUserId);
  const hasTeam = !!(activeTeamId && (memberUserIds[0] || memberUserIds[1]));

  if (!viewerUserId) {
    return (
      <div className="rounded-2xl border border-edge bg-panel px-4 py-3 text-sm text-muted">
        Log in om met je partner te syncen en je eigen voortgang bij te houden.{" "}
        <Link href="/login" className="font-semibold text-gold underline-offset-2 hover:underline">
          Naar login
        </Link>
      </div>
    );
  }

  const myName = my !== null ? names[my] : names[0];
  const partnerIdx: 0 | 1 | null = my === null ? null : my === 0 ? 1 : 0;
  const partnerName =
    partnerIdx !== null && hasTeam && memberUserIds[partnerIdx]
      ? names[partnerIdx]
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Jouw duo</p>
        <p className="truncate text-sm text-ink">
          <span className="font-semibold text-cyan">Jij</span>
          <span className="text-muted"> · </span>
          {myName?.trim() || "Profiel"}
          {partnerName ? (
            <>
              <span className="text-faint"> · </span>
              <span className="font-semibold text-neon-hot">Partner</span>
              <span className="text-muted"> · </span>
              {partnerName}
            </>
          ) : (
            <span className="text-muted"> · geen tweede lid</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("hyrox-workspace-refresh"))}
          className="rounded-xl border border-edge-hover bg-canvas px-3 py-2 text-center text-xs font-semibold text-ink hover:border-gold/40 sm:min-h-10 sm:min-w-[140px] sm:py-2.5"
        >
          Ververs
        </button>
        <Link
          href="/profile"
          className="rounded-xl border border-edge-hover bg-canvas px-3 py-2 text-center text-xs font-semibold text-ink hover:border-gold/40 sm:min-h-10 sm:min-w-[140px] sm:py-2.5"
        >
          Profiel & team
        </Link>
      </div>
    </div>
  );
}
