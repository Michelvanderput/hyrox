import type { HyroxStationDef } from "@/lib/constants";

export function formatStationSpec(station: HyroxStationDef): string {
  const bits: string[] = [];
  if ("distance" in station && station.distance) bits.push(station.distance);
  if ("reps" in station && station.reps) bits.push(`${station.reps} reps`);
  if (!station.weights) return bits.join(" · ");

  const w = station.weights;
  const open = `Open · H ${w.men_open} / V ${w.women_open}`;
  const pro = `Pro · H ${w.men_pro} / V ${w.women_pro}`;
  return [...bits, open, pro].join(" · ");
}
