"use client";

import { TOTAL_WEEKS } from "@/lib/constants";
import { countWorkoutsInWeek, formatWeekDateRangeNl, getPhaseForWeek } from "@/lib/training-plan";
import { useTrackerStore } from "@/lib/store";

export function WeekSelector({
  currentCalendarWeek,
  selectedWeek,
  onSelect,
}: {
  currentCalendarWeek: number;
  selectedWeek: number;
  onSelect: (w: number) => void;
}) {
  const getWeekProgress = useTrackerStore((s) => s.getWeekProgress);

  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => {
        const ph = getPhaseForWeek(w);
        const p0 = getWeekProgress(0, w);
        const p1 = getWeekProgress(1, w);
        const any = p0.done > 0 || p1.done > 0;
        const all = p0.done === p0.total && p1.done === p1.total && p0.total > 0;
        const cur = w === currentCalendarWeek;
        const sel = w === selectedWeek;
        const range = formatWeekDateRangeNl(w, countWorkoutsInWeek(w));
        return (
          <button
            key={w}
            type="button"
            title={`Week ${w} · ${ph.label} · ${range}`}
            aria-current={sel ? "true" : undefined}
            onClick={() => onSelect(w)}
            className={`relative flex min-h-9 min-w-9 items-center justify-center rounded-xl border px-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
              sel
                ? "z-[1] border-neon-hot/80 bg-neon-hot/22 text-ink shadow-[0_0_20px_rgba(212,255,0,0.22)] ring-2 ring-neon-hot/90"
                : cur
                  ? "border-neon-hot/55 text-neon-hot shadow-[0_0_14px_rgba(163,255,51,0.1)] hover:border-neon-hot/75"
                  : "border-white/10 text-muted hover:border-white/22 hover:text-ink"
            }`}
            style={{ borderLeftWidth: 3, borderLeftColor: ph.color }}
          >
            {w}
            {any && (
              <span
                className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${
                  all ? "bg-neon-hot shadow-[0_0_6px_rgba(212,255,0,0.7)]" : "bg-success"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
