"use client";

import Link from "next/link";

import { TOTAL_WEEKS } from "@/lib/constants";
import { completionKey } from "@/lib/utils";
import { generateWeek } from "@/lib/training-plan";
import { useTrackerStore } from "@/lib/store";
import { WORKOUT_TYPE_META } from "@/lib/workout-styles";

import { NeonProgressBar } from "@/components/ui/NeonProgressBar";

export function HomeWeekPreview({
  weekNumber,
  compact = false,
}: {
  weekNumber: number;
  /** Minder randtekst (bijv. op home naast andere voortgang). */
  compact?: boolean;
}) {
  const completions = useTrackerStore((s) => s.completions);
  const names = useTrackerStore((s) => s.athleteNames);
  const getWeekProgress = useTrackerStore((s) => s.getWeekProgress);
  const getDayOrderForWeek = useTrackerStore((s) => s.getDayOrderForWeek);
  const days = generateWeek(weekNumber);
  const dayOrder = getDayOrderForWeek(weekNumber, days.length);

  const w0 = getWeekProgress(0, weekNumber);
  const w1 = getWeekProgress(1, weekNumber);
  const weekPct =
    w0.total > 0 ? Math.round(((w0.done + w1.done) / (2 * w0.total)) * 100) : 0;

  return (
    <section className="hyrox-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-bold tracking-tight text-ink">Deze week</h2>
          <p className="mt-0.5 text-[11px] text-muted">Dag-voor-dag · week {weekNumber}</p>
        </div>
        <Link
          href={`/plan?week=${weekNumber}`}
          className="hyrox-btn-ghost inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-xs font-semibold"
        >
          Open plan
        </Link>
      </div>
      <div className="mt-3">
        <NeonProgressBar value={weekPct} />
        {!compact && (
          <p className="mt-1.5 text-[10px] text-faint">Samen · {weekPct}%</p>
        )}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-faint">
        Iets vergeten? Open het weekplan (knop hierboven) en gebruik{" "}
        <span className="font-semibold text-muted">← Vorige</span> om eerdere weken alsnog af te
        vinken.
      </p>
      <ul className="mt-4 space-y-2">
        {dayOrder.map((origDi) => {
          const d = days[origDi]!;
          const meta = WORKOUT_TYPE_META[d.type];
          const a0 = completions[completionKey(0, weekNumber, origDi)];
          const a1 = completions[completionKey(1, weekNumber, origDi)];
          return (
            <li
              key={d.dayLabel}
              className={`flex items-center gap-3 rounded-2xl border border-white/[0.06] px-3 py-2.5 ${meta.bg} ${meta.border}`}
            >
              <div className="w-10 shrink-0 text-center">
                <div className={`font-heading text-xs font-bold ${meta.text}`}>{d.dayLabel}</div>
                <div className="text-[9px] text-faint">{meta.label}</div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">{d.title}</p>
                <p className="truncate text-[11px] text-muted">{d.durationLabel}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold ${
                    a0 ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-faint"
                  }`}
                  title={names[0]}
                >
                  1
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold ${
                    a1
                      ? "border-neon-hot/50 bg-neon/10 text-neon-hot"
                      : "border-white/10 text-faint"
                  }`}
                  title={names[1]}
                >
                  2
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {!compact && (
        <p className="mt-3 text-center text-[10px] text-faint">
          Week {weekNumber} van {TOTAL_WEEKS}
        </p>
      )}
    </section>
  );
}
