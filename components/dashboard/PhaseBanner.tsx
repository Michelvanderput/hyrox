import { TOTAL_WEEKS } from "@/lib/constants";
import { getPhaseForWeek } from "@/lib/training-plan";

export function PhaseBanner({ weekNumber }: { weekNumber: number }) {
  const phase = getPhaseForWeek(weekNumber);
  return (
    <div
      className="hyrox-card px-4 py-3.5 sm:px-5 sm:py-4"
      style={{
        borderColor: `${phase.color}40`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${phase.color} 14%, #1c1c1e) 0%, #1c1c1e 55%)`,
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Huidige fase
        </span>
        <span className="font-heading text-sm font-bold" style={{ color: phase.color }}>
          {phase.label}
        </span>
        <span className="text-[11px] text-faint">
          · week {weekNumber} / {TOTAL_WEEKS}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{phase.description}</p>
    </div>
  );
}
