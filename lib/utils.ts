export function completionKey(
  athleteIndex: number,
  weekNumber: number,
  dayIndex: number,
): string {
  return `${athleteIndex}-${weekNumber}-${dayIndex}`;
}

export function parseCompletionKey(key: string): {
  athleteIndex: number;
  weekNumber: number;
  dayIndex: number;
} | null {
  const [a, w, d] = key.split("-").map(Number);
  if ([a, w, d].some((n) => Number.isNaN(n))) return null;
  return { athleteIndex: a, weekNumber: w, dayIndex: d };
}

export function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Toon kg met NL-decimaal (max 1 decimaal als het geen geheel is). */
export function formatKg(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return "—";
  const rounded = Math.round(kg * 10) / 10;
  const s = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
  return `${s} kg`;
}

export function formatRaceCountdown(ms: number): {
  d: number;
  h: number;
  m: number;
  s: number;
} {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}
