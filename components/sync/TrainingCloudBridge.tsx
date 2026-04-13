"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getWorkspaceSnapshotAction, listMyTeamsAction } from "@/app/actions/workspace";
import { TrainingCloudProvider } from "@/context/TrainingCloudContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useTrackerStore } from "@/lib/store";
import {
  ACTIVE_TEAM_STORAGE_KEY,
  readActiveTeamId,
  writeActiveTeamId,
} from "@/lib/sync/workspace-storage";

import type { TeamSummary } from "@/app/actions/workspace";

import { CompletionsRealtimeSync } from "@/components/sync/CompletionsRealtimeSync";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export function TrainingCloudBridge({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);

  const refreshWorkspace = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUserId(null);
      setTeams([]);
      useTrackerStore.getState().clearCloudWorkspace();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setUserId(null);
      setTeams([]);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user.id ?? null;
    setUserId(uid);

    if (!uid) {
      setTeams([]);
      useTrackerStore.getState().clearCloudWorkspace();
      return;
    }

    const teamsRes = await listMyTeamsAction();
    if (!teamsRes.ok) {
      return;
    }

    setTeams(teamsRes.data.teams);

    if (teamsRes.data.teams.length === 0) {
      useTrackerStore.getState().clearCloudWorkspace();
      return;
    }

    let teamId = readActiveTeamId();
    if (!teamId || !teamsRes.data.teams.some((t) => t.id === teamId)) {
      teamId = teamsRes.data.teams[0].id;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, teamId);
      }
    }

    const snap = await getWorkspaceSnapshotAction(teamId);
    if (!snap.ok) {
      return;
    }

    useTrackerStore.getState().applyWorkspaceSnapshot({
      teamId,
      members: snap.data.members,
      completions: snap.data.completions,
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const initial = window.setTimeout(() => {
      void refreshWorkspace();
    }, 0);

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void refreshWorkspace();
      }, 0);
    });

    const onRefresh = () => {
      window.setTimeout(() => {
        void refreshWorkspace();
      }, 0);
    };
    window.addEventListener("hyrox-workspace-refresh", onRefresh);

    return () => {
      window.clearTimeout(initial);
      sub.subscription.unsubscribe();
      window.removeEventListener("hyrox-workspace-refresh", onRefresh);
    };
  }, [refreshWorkspace]);

  const selectTeam = useCallback((teamId: string) => {
    writeActiveTeamId(teamId);
  }, []);

  const value = useMemo(
    () => ({
      userId,
      teams,
      activeTeamId,
      selectTeam,
    }),
    [userId, teams, activeTeamId, selectTeam],
  );

  return (
    <TrainingCloudProvider value={value}>
      <CompletionsRealtimeSync />
      <OnboardingGate>{children}</OnboardingGate>
    </TrainingCloudProvider>
  );
}
