"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ActionResult } from "@/app/actions/types";

export type UpsertCompletionInput = {
  teamId: string;
  weekNumber: number;
  dayIndex: number;
  completed: boolean;
  rating?: number;
  notes?: string;
  actualDurationMin?: number;
};

export async function upsertMyCompletionAction(
  input: UpsertCompletionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je bent niet ingelogd." };

    const { data: membership, error: memErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", input.teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) return { ok: false, error: memErr.message };
    if (!membership) return { ok: false, error: "Je zit niet in dit team." };

    const payload = {
      user_id: user.id,
      team_id: input.teamId,
      week_number: input.weekNumber,
      day_index: input.dayIndex,
      completed: input.completed,
      rating: input.rating ?? null,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      actual_duration_min: input.actualDurationMin ?? null,
    };

    const { data, error } = await supabase
      .from("completions")
      .upsert(payload, { onConflict: "user_id,team_id,week_number,day_index" })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Opslaan mislukt." };
    }

    revalidatePath("/plan");
    revalidatePath("/");
    revalidatePath("/profile");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}
