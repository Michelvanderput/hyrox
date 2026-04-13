"use client";

import { createContext, useContext } from "react";

import type { TeamSummary } from "@/app/actions/workspace";

export type TrainingCloudValue = {
  userId: string | null;
  teams: TeamSummary[];
  activeTeamId: string | null;
  selectTeam: (teamId: string) => void;
};

const TrainingCloudContext = createContext<TrainingCloudValue | null>(null);

export function TrainingCloudProvider({
  value,
  children,
}: {
  value: TrainingCloudValue;
  children: React.ReactNode;
}) {
  return (
    <TrainingCloudContext.Provider value={value}>{children}</TrainingCloudContext.Provider>
  );
}

export function useTrainingCloud(): TrainingCloudValue {
  const ctx = useContext(TrainingCloudContext);
  if (!ctx) {
    return {
      userId: null,
      teams: [],
      activeTeamId: null,
      selectTeam: () => {},
    };
  }
  return ctx;
}
