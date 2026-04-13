"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { HyroxStationDef } from "@/lib/constants";
import { formatStationSpec } from "@/lib/format-station";
import { STATION_ENCYCLOPEDIA } from "@/lib/station-encyclopedia";

export function StationCard({
  station,
  order,
}: {
  station: HyroxStationDef;
  order: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const extra = STATION_ENCYCLOPEDIA[station.id];

  return (
    <article className="rounded-2xl border border-edge bg-panel p-4 transition hover:border-edge-hover hover:bg-panel-hover sm:p-5">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className="group flex w-full items-start gap-3 rounded-xl text-left outline-none ring-gold/40 transition focus-visible:ring-2"
      >
        <span className="text-2xl" aria-hidden>
          {station.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-sm font-bold text-ink">
              <span className="mr-2 text-faint">#{order}</span>
              {station.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted group-hover:text-ink">
              {expanded ? (
                <>
                  <span className="hidden sm:inline">Inklappen</span>
                  <ChevronUp className="size-4 text-gold" aria-hidden />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Meer info</span>
                  <ChevronDown className="size-4 text-gold" aria-hidden />
                </>
              )}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">{formatStationSpec(station)}</p>
        </div>
      </button>

      <div className="mt-3 rounded-xl border border-edge bg-canvas px-3 py-2 text-[12px] leading-relaxed text-muted">
        <span className="font-semibold text-ink/80">Tip:</span> {station.techniqueTip}
      </div>

      {expanded ? (
        <div
          id={panelId}
          className="mt-4 space-y-4 border-t border-edge pt-4"
          role="region"
          aria-label={`Extra informatie ${station.name}`}
        >
          <p className="text-[13px] leading-relaxed text-muted">{extra.info}</p>
          {extra.pitfalls ? (
            <p className="text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-race/90">Let op:</span> {extra.pitfalls}
            </p>
          ) : null}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wide text-gold">
              Oefeningen die hier goed bij passen
            </h4>
            <ul className="mt-2 space-y-2.5">
              {extra.exercises.map((ex) => (
                <li
                  key={ex.name}
                  className="rounded-xl border border-edge bg-canvas px-3 py-2 text-[12px] text-muted"
                >
                  <span className="font-semibold text-ink">{ex.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed">{ex.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}
