"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useTrackerStore } from "@/lib/store";

import { NeonProgressBar } from "@/components/ui/NeonProgressBar";

const R = 36;
const C = 2 * Math.PI * R;

export function AthleteRingCard({
  athleteIndex,
  weekNumber,
}: {
  athleteIndex: 0 | 1;
  weekNumber: number;
}) {
  const reduce = useReducedMotion();
  const gradId = useId().replace(/:/g, "");
  const names = useTrackerStore((s) => s.athleteNames);
  const setAthleteName = useTrackerStore((s) => s.setAthleteName);
  const getTotalProgress = useTrackerStore((s) => s.getTotalProgress);
  const getWeekProgress = useTrackerStore((s) => s.getWeekProgress);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);

  const [editing, setEditing] = useState(false);
  const name = names[athleteIndex];
  const nameFromCloud = !!(activeTeamId && memberUserIds[athleteIndex]);
  const accent = athleteIndex === 0 ? { label: "text-cyan" as const } : { label: "text-neon-hot" as const };
  const total = getTotalProgress(athleteIndex);
  const week = getWeekProgress(athleteIndex, weekNumber);
  const pctTotal = total.total ? Math.round((total.done / total.total) * 100) : 0;
  const pctWeek = week.total ? Math.round((week.done / week.total) * 100) : 0;
  const offset = C - (C * pctTotal) / 100;

  const strokeGrad = athleteIndex === 0 ? `url(#ring-${gradId})` : `url(#ring-alt-${gradId})`;

  return (
    <div className="hyrox-card border-white/[0.07] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {nameFromCloud ? (
            <span
              className={`block max-w-full truncate font-heading text-base font-bold ${accent.label}`}
              title="Naam uit je team / profiel"
            >
              {name || `Teamlid ${athleteIndex === 0 ? "A" : "B"}`}
            </span>
          ) : editing ? (
            <input
              autoFocus
              className="w-full border-b border-dashed border-white/20 bg-transparent font-heading text-base font-bold text-ink outline-none focus:border-neon"
              value={name}
              onChange={(e) => setAthleteName(athleteIndex, e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
              }}
              aria-label={`Naam atleet ${athleteIndex + 1}`}
            />
          ) : (
            <button
              type="button"
              className={`block max-w-full truncate text-left font-heading text-base font-bold ${accent.label}`}
              onClick={() => setEditing(true)}
              title="Klik om naam te wijzigen (lokaal zonder cloudteam)"
            >
              {name || `Teamlid ${athleteIndex === 0 ? "A" : "B"}`}
            </button>
          )}
          <p className="mt-1 text-[11px] text-muted">
            {total.done}/{total.total} workouts totaal
          </p>
        </div>
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
            <defs>
              <linearGradient id={`ring-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
              <linearGradient id={`ring-alt-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a3ff33" />
                <stop offset="100%" stopColor="#d4ff00" />
              </linearGradient>
            </defs>
            <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke={strokeGrad}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={
                reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }
              }
              transform="rotate(-90 42 42)"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-lg font-extrabold leading-none text-ink">{pctTotal}%</span>
            <span className="text-[8px] font-medium uppercase tracking-wide text-faint">totaal</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted">
          <span>Week {weekNumber}</span>
          <span>
            {week.done}/{week.total}
          </span>
        </div>
        <NeonProgressBar value={pctWeek} />
      </div>
    </div>
  );
}
