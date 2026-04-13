export type WorkoutType =
  | "run"
  | "gym"
  | "station"
  | "combo"
  | "class"
  | "rest"
  | "race";

export interface DayWorkout {
  dayLabel: string;
  title: string;
  type: WorkoutType;
  /** Korte samenvatting op kaarten / lijsten */
  description: string;
  durationLabel: string;
  /** Optioneel: stappen, intensiteit, materiaal, coaching (diepgaand) */
  detail?: string;
}

export interface PhaseInfo {
  id: string;
  name: string;
  label: string;
  weeks: readonly number[];
  color: string;
  description: string;
}

export interface PersonalRecordEntry {
  id: string;
  athleteIndex: 0 | 1;
  stationId: string;
  value: number;
  recordedAt: string;
  notes?: string;
}

export interface CompletionMeta {
  rating?: number;
  notes?: string;
  actualDurationMin?: number;
}
