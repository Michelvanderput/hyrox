import { HYROX_STATIONS } from "@/lib/constants";

import { StationCard } from "@/components/stations/StationCard";
import { RaceFormatVisual } from "@/components/stations/RaceFormatVisual";
import { DoublesStrategy } from "@/components/stations/DoublesStrategy";

export default function StationsPage() {
  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="font-heading text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-station via-neon to-cyan bg-clip-text text-transparent">
            Stations encyclopedie
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Alle 8 HYROX stations met specs (open vs pro) en techniektips.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {HYROX_STATIONS.map((s, i) => (
          <StationCard key={s.id} station={s} order={i + 1} />
        ))}
      </div>

      <RaceFormatVisual />
      <DoublesStrategy />
    </div>
  );
}
