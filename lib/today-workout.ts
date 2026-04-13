import { getCurrentWeekNumber, generateWeek, getPhaseForWeek } from "@/lib/training-plan";
import type { DayWorkout } from "@/types";

/** Ma = 0 … Zo = 6 (zoals in `generateWeek`). */
export function getPlanDayIndexForDate(d: Date): number {
  const js = d.getDay(); // 0 = zo
  return js === 0 ? 6 : js - 1;
}

export function resolveTodayWorkout(now = Date.now()): {
  weekNumber: number;
  dayIndex: number;
  workout: DayWorkout;
  phaseLabel: string;
  dateLabel: string;
} {
  const date = new Date(now);
  const weekNumber = getCurrentWeekNumber(now);
  const dayIndex = getPlanDayIndexForDate(date);
  const days = generateWeek(weekNumber);
  const workout = days[dayIndex] ?? days[0];
  const phase = getPhaseForWeek(weekNumber);
  const dateLabel = date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return { weekNumber, dayIndex, workout, phaseLabel: phase.label, dateLabel };
}
