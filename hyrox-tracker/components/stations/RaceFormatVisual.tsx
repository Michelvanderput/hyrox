import { HYROX_STATIONS } from "@/lib/constants";

export function RaceFormatVisual() {
  return (
    <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-base font-bold text-ink">Race format</h2>
      <p className="mt-1 text-[12px] text-muted">
        1 km hardlopen → station, herhaal 8× (HYROX Doubles: samen lopen, stations splitsen).
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HYROX_STATIONS.map((s, i) => (
          <div
            key={s.id}
            className="rounded-xl border border-edge bg-canvas px-2 py-3 text-center"
          >
            <div className="text-[9px] font-semibold uppercase tracking-wide text-gold">
              1 km →
            </div>
            <div className="mt-1 text-xl" aria-hidden>
              {s.icon}
            </div>
            <div className="mt-1 text-[10px] font-semibold text-muted">{s.name}</div>
            <div className="mt-1 text-[9px] text-faint">#{i + 1}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center font-heading text-sm font-extrabold text-gold">
        → finish
      </div>
    </div>
  );
}
