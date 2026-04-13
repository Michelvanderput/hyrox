import { isPrStationId, PR_STATION_UNITS, type PRStationId } from "@/lib/constants";
import { formatKg, formatSeconds } from "@/lib/utils";

export function formatPrValue(stationId: string, value: number): string {
  if (!isPrStationId(stationId)) return String(value);
  const unit = PR_STATION_UNITS[stationId];
  return unit === "kg" ? formatKg(value) : formatSeconds(value);
}

export function prValueUnitLabel(stationId: PRStationId): string {
  return PR_STATION_UNITS[stationId] === "kg" ? "kg" : "seconden";
}
