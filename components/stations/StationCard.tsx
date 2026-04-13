"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import type { HyroxStationDef } from "@/lib/constants";
import { formatStationSpec } from "@/lib/format-station";

import { StationDetailModal } from "@/components/stations/StationDetailModal";

export function StationCard({
  station,
  order,
}: {
  station: HyroxStationDef;
  order: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="rounded-2xl border border-edge bg-panel p-4 transition hover:border-edge-hover hover:bg-panel-hover sm:p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            {station.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-sm font-bold text-ink">
              <span className="mr-2 text-faint">#{order}</span>
              {station.name}
            </h3>
            <p className="mt-1 text-[11px] text-muted">{formatStationSpec(station)}</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-edge bg-canvas px-3 py-2 text-[12px] leading-relaxed text-muted">
          <span className="font-semibold text-ink/80">Tip:</span> {station.techniqueTip}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full min-h-10 items-center justify-center gap-2 rounded-xl border border-edge-hover bg-canvas text-xs font-semibold text-ink hover:border-gold/40"
        >
          <Info className="size-4 text-gold" aria-hidden />
          Meer info & oefeningen
        </button>
      </article>

      <StationDetailModal
        open={open}
        onClose={() => setOpen(false)}
        station={station}
        order={order}
      />
    </>
  );
}
