import { PHASES, TOTAL_WEEKS, TRAINING_START_ISO } from "@/lib/constants";
import { TRAINING_WEEKS } from "@/lib/training-weeks-data";
import type { DayWorkout, PhaseInfo } from "@/types";

const START = new Date(TRAINING_START_ISO);

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
