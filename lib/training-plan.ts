import { PHASES, TOTAL_WEEKS, TRAINING_START_ISO } from "@/lib/constants";
import { TRAINING_WEEKS } from "@/lib/training-weeks-data";
import type { DayWorkout, PhaseInfo } from "@/types";

const START = new Date(TRAINING_START_ISO);
const MS_DAY = 86_400_000;

const fmtWeekdayDayMonth = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const fmtDayMonth = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
});

const fmtYear = new Intl.DateTimeFormat("nl-NL", { year: "numeric" });

/** Kalenderdatum voor schema-dag (Ma = dag 0 binnen die trainingsweek). */
export function getScheduledDate(weekNumber: number, dayIndex: number): Date {
  const w = Math.max(1, Math.min(TOTAL_WEEKS, weekNumber));
  const di = Math.max(0, dayIndex);
  return new Date(START.getTime() + (w - 1) * 7 * MS_DAY + di * MS_DAY);
}

/** bv. "ma 14 apr" */
export function formatScheduledDayNl(weekNumber: number, dayIndex: number): string {
  return fmtWeekdayDayMonth.format(getScheduledDate(weekNumber, dayIndex));
}

/** bv. "14 apr – 20 apr 2026" voor de zichtbare dagen in die week. */
export function formatWeekDateRangeNl(weekNumber: number, dayCount: number): string {
  const n = Math.max(1, dayCount);
  const a = getScheduledDate(weekNumber, 0);
  const b = getScheduledDate(weekNumber, n - 1);
  const y = fmtYear.format(a);
  const left = fmtDayMonth.format(a);
  const right = fmtDayMonth.format(b);
  if (left === right) return `${left} ${y}`;
  return `${left} – ${right} ${y}`;
}

export function getPhaseForWeek(weekNumber: number): PhaseInfo {
  return PHASES.find((p) => p.weeks.includes(weekNumber)) ?? PHASES[PHASES.length - 1];
}

export function getCurrentWeekNumber(now = Date.now()): number {
  const diff = now - START.getTime();
  const w = Math.ceil(diff / 604800000);
  return Math.max(1, Math.min(TOTAL_WEEKS, w));
}

export function generateWeek(weekNumber: number): DayWorkout[] {
  const w = Math.max(1, Math.min(TOTAL_WEEKS, weekNumber));
  return TRAINING_WEEKS[w - 1];
}

export function countWorkoutsInWeek(weekNumber: number): number {
  return generateWeek(weekNumber).length;
}

export function suggestRecoveryNote(
  rating: number | undefined,
): string | null {
  if (rating === undefined) return null;
  if (rating <= 2) {
    return "Laatste sessie voelde zwaar — morgen iets lichter (extra rust, kortere intervals of mobiliteit).";
  }
  return null;
}
