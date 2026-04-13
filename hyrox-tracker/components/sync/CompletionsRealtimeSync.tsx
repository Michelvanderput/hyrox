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
      useTrackerStore.getState().applyRemoteCompletionPayload({
        eventType: payload.eventType,
        new: (payload.new as CompletionRow | null) ?? null,
        old: (payload.old as CompletionRow | null) ?? null,
      });
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
  }, [userId, activeTeamId]);

  return null;
}
