"use client";

import Link from "next/link";

import { getCurrentWeekNumber } from "@/lib/training-plan";
import { useTrackerStore } from "@/lib/store";

import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { TeammateMotivationCard } from "@/components/dashboard/TeammateMotivationCard";
import { AthleteRingCard } from "@/components/dashboard/AthleteRingCard";
import { PhaseBanner } from "@/components/dashboard/PhaseBanner";
import { HomeWeekPreview } from "@/components/dashboard/HomeWeekPreview";
import { NeonProgressBar } from "@/components/ui/NeonProgressBar";

export function DashboardHome() {
  const week = getCurrentWeekNumber();
  const names = useTrackerStore((s) => s.athleteNames);
  const getTotalProgress = useTrackerStore((s) => s.getTotalProgress);
  const getWeekProgress = useTrackerStore((s) => s.getWeekProgress);

  const t0 = getTotalProgress(0);
  const t1 = getTotalProgress(1);
  const p0 = t0.total ? Math.round((t0.done / t0.total) * 100) : 0;
  const p1 = t1.total ? Math.round((t1.done / t1.total) * 100) : 0;
  const avgTotal = Math.round((p0 + p1) / 2);

  const w0 = getWeekProgress(0, week);
  const w1 = getWeekProgress(1, week);
  const weekPct =
    w0.total > 0 ? Math.round(((w0.done + w1.done) / (2 * w0.total)) * 100) : 0;

  const initial = (names[0]?.trim()?.[0] || "H").toUpperCase();

  return (
    <div className="space-y-6 pb-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-heading text-lg font-bold text-neon-hot shadow-[0_0_24px_rgba(163,255,51,0.12)]"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              HYROX Maastricht
            </p>
            <h1 className="font-heading text-xl font-black tracking-tight text-ink sm:text-2xl">
              <span className="bg-gradient-to-r from-cyan via-neon to-neon-hot bg-clip-text text-transparent">
                Doubles training
              </span>
            </h1>
            <p className="mt-0.5 text-[11px] text-faint">MECC · 17–20 sep 2026</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Gem. voortgang
          </p>
          <p
            className="mt-0.5 font-heading text-4xl font-black leading-none tabular-nums tracking-tight text-transparent sm:text-5xl"
            style={{
              backgroundImage: "linear-gradient(135deg, #22d3ee, #a3ff33, #d4ff00)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            {avgTotal}%
          </p>
          <p className="mt-1 text-[10px] text-faint">Deze week · {weekPct}%</p>
        </div>
      </header>

      <NeonProgressBar value={weekPct} className="h-1.5" />

      <Link
        href="/workout/vandaag"
        className="hyrox-card group flex items-center justify-between gap-3 border-white/[0.08] p-4 transition hover:border-neon/30"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Vandaag
          </p>
          <p className="mt-0.5 font-heading text-base font-bold text-ink group-hover:text-neon-hot">
            Workout van de dag
          </p>
          <p className="mt-1 text-[11px] text-muted">Schema, tips en snel afvinken</p>
        </div>
        <span className="text-xl text-neon-hot transition group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        <CountdownTimer />
        <TeammateMotivationCard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AthleteRingCard athleteIndex={0} weekNumber={week} />
        <AthleteRingCard athleteIndex={1} weekNumber={week} />
      </div>

      <PhaseBanner weekNumber={week} />

      <HomeWeekPreview weekNumber={week} />

      <div className="flex flex-wrap gap-2">
        <Link href="/plan" className="hyrox-btn-primary inline-flex min-h-11 flex-1 items-center justify-center px-5 text-sm sm:flex-none">
          Weekplan
        </Link>
        <Link
          href="/stations"
          className="hyrox-btn-ghost inline-flex min-h-11 flex-1 items-center justify-center px-5 text-sm font-semibold sm:flex-none"
        >
          Stations
        </Link>
        <Link
          href="/prs"
          className="hyrox-btn-ghost inline-flex min-h-11 flex-1 items-center justify-center px-5 text-sm font-semibold sm:flex-none"
        >
          PR’s
        </Link>
      </div>
    </div>
  );
}
