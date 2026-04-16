"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useTrackerStore } from "@/lib/store";
import type { Database } from "@/types/database";

type CompletionRow = Database["public"]["Tables"]["completions"]["Row"];

export function CompletionsRealtimeSync() {
  const { userId } = useTrainingCloud();
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId || !activeTeamId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const filter = `team_id=eq.${activeTeamId}`;

    const handler = (payload: RealtimePostgresChangesPayload<CompletionRow>) => {
      if (payload.table !== "completions") return;
      const row = (payload.new as CompletionRow | null) ?? null;

      useTrackerStore.getState().applyRemoteCompletionPayload({
        eventType: payload.eventType,
        new: row,
        old: (payload.old as CompletionRow | null) ?? null,
      });

      if (
        payload.eventType === "INSERT" ||
        (payload.eventType === "UPDATE" && row?.completed)
      ) {
        if (row && row.user_id !== userId && row.completed) {
          const { athleteNames: names, memberUserIds: ids } = useTrackerStore.getState();
          const teammateIdx = ids[0] === row.user_id ? 0 : ids[1] === row.user_id ? 1 : null;
          const teammateName = teammateIdx !== null ? names[teammateIdx] : "Je teamgenoot";
          void fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userIds: [userId],
              payload: {
                title: "💪 Workout afgerond!",
                body: `${teammateName} heeft een workout afgevinkt. Jij ook al?`,
                tag: "teammate-workout",
                url: "/",
              },
            }),
          });
        }
      }
    };

    const channel = supabase
      .channel(`completions-team:${activeTeamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "completions",
          filter,
        },
        handler,
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[hyrox] completions realtime:", status);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, activeTeamId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
