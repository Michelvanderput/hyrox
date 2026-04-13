import type { WorkoutType } from "@/types";

export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; border: string; bg: string; text: string }
> = {
  run: {
    label: "Run",
    border: "border-run/45",
    bg: "bg-run/12",
    text: "text-run",
  },
  gym: {
    label: "Gym",
    border: "border-gym/45",
    bg: "bg-gym/12",
    text: "text-gym",
  },
  station: {
    label: "Station",
    border: "border-station/45",
    bg: "bg-station/12",
    text: "text-station",
  },
  combo: {
    label: "Combo",
    border: "border-neon-hot/40",
    bg: "bg-neon/8",
    text: "text-neon-hot",
  },
  class: {
    label: "Les",
    border: "border-class/45",
    bg: "bg-class/12",
    text: "text-class",
  },
  rest: {
    label: "Rust",
    border: "border-white/10",
    bg: "bg-white/[0.04]",
    text: "text-faint",
  },
  race: {
    label: "Race",
    border: "border-race/50",
    bg: "bg-race/14",
    text: "text-race",
  },
};
