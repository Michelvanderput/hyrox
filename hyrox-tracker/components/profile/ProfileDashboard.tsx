"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getCurrentWeekNumber } from "@/lib/training-plan";
import { useTrackerStore } from "@/lib/store";
import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { TeamSetupCard } from "@/components/profile/TeamSetupCard";
import { TeamSwitcherCard } from "@/components/profile/TeamSwitcherCard";
import { UserSessionCard } from "@/components/profile/UserSessionCard";

export function ProfileDashboard() {
  const { userId: cloudUserId, activeTeamId: cloudTeamId } = useTrainingCloud();
  const names = useTrackerStore((s) => s.athleteNames);
  const completions = useTrackerStore((s) => s.completions);
  /* getPhaseProgress / getWeeklyAdherence return fresh arrays; subscribe only to `completions`
     and memoize so Zustand does not see a “new” slice every render (max update depth). */
  const phases = useMemo(
    () => useTrackerStore.getState().getPhaseProgress(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derived from completions via getState
    [completions],
  );
  const adherence = useMemo(
    () => useTrackerStore.getState().getWeeklyAdherence(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derived from completions via getState
    [completions],
  );
  const exportSnapshot = useTrackerStore((s) => s.exportSnapshot);
  const importSnapshot = useTrackerStore((s) => s.importSnapshot);
  const resetProgress = useTrackerStore((s) => s.resetProgress);

  const fileRef = useRef<HTMLInputElement>(null);

  const barData = adherence.map((w) => ({
    w: `W${w.week}`,
    a0: w.a0,
    a1: w.a1,
  }));

  const cw = getCurrentWeekNumber();

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h1 className="font-heading text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan via-neon to-neon-hot bg-clip-text text-transparent">
            Profiel
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Huidige kalenderweek: <span className="text-ink">{cw}</span> · basisdata in localStorage;
          met ingelogd team worden afvinken + Realtime sync naar Supabase gestuurd.
        </p>
        {cloudUserId && cloudTeamId && (
          <p className="mt-2 text-[11px] font-medium text-success">
            ● Live sync actief — wijzigingen in het plan verschijnen bij je partner zonder refresh.
          </p>
        )}
      </header>

      <UserSessionCard />
      <TeamSetupCard />
      <TeamSwitcherCard />

      {cloudUserId && (
        <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
          <h2 className="font-heading text-sm font-bold">Accountgegevens</h2>
          <p className="mt-1 text-sm text-muted">
            Naam, geslacht (voor station-gewichten) en trainingsniveau kun je hier bijwerken.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold text-ink"
          >
            Profiel bewerken
          </Link>
        </section>
      )}

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Voortgang per fase</h2>
        <p className="mt-1 text-[11px] text-muted">Percentage afgevinkte dagen per atleet.</p>
        <div className="mt-4 space-y-3">
          {phases.map((p) => (
            <div
              key={p.phaseId}
              className="rounded-xl border border-edge bg-canvas p-3"
              style={{ borderColor: `${p.color}33` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-heading text-sm font-bold" style={{ color: p.color }}>
                    {p.label}
                  </div>
                  <div className="text-[11px] text-muted">
                    Week {p.weeks[0]}–{p.weeks[p.weeks.length - 1]}
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  <div>
                    {names[0]}: <span className="font-semibold text-run">{p.pctA0}%</span>
                  </div>
                  <div>
                    {names[1]}: <span className="font-semibold text-station">{p.pctA1}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-edge">
                  <div
                    className="h-full rounded-full bg-run"
                    style={{ width: `${p.pctA0}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-edge">
                  <div
                    className="h-full rounded-full bg-station"
                    style={{ width: `${p.pctA1}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Week adherence</h2>
        <div className="mt-4 h-56 w-full min-w-0 min-h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke="#16161e" vertical={false} />
              <XAxis dataKey="w" stroke="#555" tick={{ fontSize: 9 }} interval={3} />
              <YAxis domain={[0, 100]} stroke="#555" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#0e0e16",
                  border: "1px solid #16161e",
                  borderRadius: 12,
                  color: "#e4e4ec",
                  fontSize: 12,
                }}
              />
              <Bar name={names[0]} dataKey="a0" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
              <Bar name={names[1]} dataKey="a1" fill="var(--accent-pink)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Export / import</h2>
        <p className="mt-2 text-sm text-muted">
          Maak een JSON backup van jullie lokale state (completions, PR’s, namen).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="hyrox-btn-primary min-h-11 rounded-xl px-4 text-sm"
            onClick={() => {
              const blob = new Blob([exportSnapshot()], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `hyrox-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download JSON
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const text = await f.text();
              try {
                importSnapshot(JSON.parse(text));
              } catch {
                alert("Ongeldig JSON bestand.");
              }
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-race/30 bg-race/5 p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold text-race">Gevaarzone</h2>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl border border-race/40 bg-canvas px-4 text-sm font-semibold text-race"
          onClick={() => {
            if (confirm("Alle voortgang (checks + meta) wissen? PR’s blijven staan.")) {
              resetProgress();
            }
          }}
        >
          Reset voortgang (checks)
        </button>
      </section>
    </div>
  );
}
