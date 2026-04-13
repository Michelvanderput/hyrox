"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/types";

export type { ActionResult } from "@/app/actions/types";

export async function createTeamAction(
  name: string,
): Promise<ActionResult<{ inviteCode: string; teamId: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je bent niet ingelogd." };

    const { data: team, error } = await supabase
      .from("teams")
      .insert({ name: name.trim() || "HYROX Duo" })
      .select("id, invite_code")
      .single();

    if (error || !team) {
      return { ok: false, error: error?.message ?? "Team aanmaken mislukt." };
    }

    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      color: "#38bdf8",
    });

    if (memberError) {
      return { ok: false, error: memberError.message };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    return { ok: true, data: { inviteCode: team.invite_code, teamId: team.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}

export async function joinTeamByCodeAction(
  code: string,
): Promise<ActionResult<{ teamId: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Log eerst in om je bij een team te voegen." };

    const { data, error } = await supabase.rpc("join_team_by_code", { p_code: code });

    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data) {
      return { ok: false, error: "Kon team niet joinen." };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    const teamId = data as string;
    return { ok: true, data: { teamId } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}

export async function updateTeamNameAction(
  teamId: string,
  name: string,
): Promise<ActionResult<{ name: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je bent niet ingelogd." };

    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Vul een teamnaam in." };

    const { data: membership, error: memErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) return { ok: false, error: memErr.message };
    if (!membership) return { ok: false, error: "Je zit niet in dit team." };

    const { error } = await supabase.from("teams").update({ name: trimmed }).eq("id", teamId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/profile");
    return { ok: true, data: { name: trimmed } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}
