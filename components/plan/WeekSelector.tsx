"use client";

import { TOTAL_WEEKS } from "@/lib/constants";
import { getPhaseForWeek } from "@/lib/training-plan";
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
        return (
          <button
            key={w}
            type="button"
            title={`Week ${w} · ${ph.label}`}
            onClick={() => onSelect(w)}
            className={`relative flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 px-1 text-xs font-bold transition ${
              cur ? "border-neon-hot/70 text-neon-hot shadow-[0_0_16px_rgba(163,255,51,0.12)]" : "text-muted hover:border-white/20 hover:text-ink"
            } ${sel ? "bg-white/[0.06] text-ink ring-1 ring-white/12" : ""}`}
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
