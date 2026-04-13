"use client";

import { upsertMyCompletionAction } from "@/app/actions/completions";
import { useTrackerStore } from "@/lib/store";
import { completionKey } from "@/lib/utils";

export async function pushCompletionSnapshot(input: {
  userId: string;
  athleteIndex: 0 | 1;
  weekNumber: number;
  dayIndex: number;
}) {
  const state = useTrackerStore.getState();
  if (!state.activeTeamId) {
    return { ok: false as const, error: "Geen actief team." };
  }
  if (state.memberUserIds[input.athleteIndex] !== input.userId) {
    return { ok: false as const, error: "Alleen eigen workouts syncen naar de cloud." };
  }

  const key = completionKey(input.athleteIndex, input.weekNumber, input.dayIndex);
  const meta = state.completionMeta[key] ?? {};
  const completed = !!state.completions[key];

  return upsertMyCompletionAction({
    teamId: state.activeTeamId,
    weekNumber: input.weekNumber,
    dayIndex: input.dayIndex,
    completed,
    rating: meta.rating,
    notes: meta.notes,
    actualDurationMin: meta.actualDurationMin,
  });
}
