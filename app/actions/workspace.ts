"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/types";
import type { Database } from "@/types/database";

export type CompletionRow = Database["public"]["Tables"]["completions"]["Row"];

export type TeamSummary = {
  id: string;
  name: string;
  inviteCode: string;
};

export type TeamMemberSummary = {
  userId: string;
  name: string;
  /** Persoonlijk bericht voor de partner (optioneel). */
  motivationNote: string | null;
};

function displayNameFromProfile(name: string | null | undefined, email: string | null | undefined) {
  const n = name?.trim();
  if (n) return n;
  const em = email?.trim();
  if (em?.includes("@")) {
    const local = em.split("@")[0]?.trim();
    if (local) return local;
  }
  return "Deelnemer";
}

export async function listMyTeamsAction(): Promise<ActionResult<{ teams: TeamSummary[] }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: true, data: { teams: [] } };

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams ( id, name, invite_code )")
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []) as Array<{
      team_id: string;
      teams: { id: string; name: string | null; invite_code: string } | null;
    }>;

    const teams: TeamSummary[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const t = row.teams;
      if (!t?.id || seen.has(t.id)) continue;
      seen.add(t.id);
      teams.push({
        id: t.id,
        name: t.name?.trim() || "HYROX Duo",
        inviteCode: t.invite_code,
      });
    }

    teams.sort((a, b) => a.name.localeCompare(b.name));
    return { ok: true, data: { teams } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}

export async function getWorkspaceSnapshotAction(
  teamId: string,
): Promise<ActionResult<{ members: TeamMemberSummary[]; completions: CompletionRow[] }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je bent niet ingelogd." };

    const { data: membership, error: memErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) return { ok: false, error: memErr.message };
    if (!membership) return { ok: false, error: "Je zit niet in dit team." };

    const { data: memberRows, error: membersError } = await supabase
      .from("team_members")
      .select("user_id, motivation_note, profiles ( name, email )")
      .eq("team_id", teamId);

    if (membersError) return { ok: false, error: membersError.message };

    const typedMembers = (memberRows ?? []) as Array<{
      user_id: string;
      motivation_note: string | null;
      profiles: { name: string | null; email: string | null } | null;
    }>;

    const members: TeamMemberSummary[] = typedMembers.map((m) => ({
      userId: m.user_id,
      name: displayNameFromProfile(m.profiles?.name, m.profiles?.email),
      motivationNote: m.motivation_note?.trim() || null,
    }));

    members.sort((a, b) => a.userId.localeCompare(b.userId));

    const { data: completionRows, error: compErr } = await supabase
      .from("completions")
      .select("*")
      .eq("team_id", teamId);

    if (compErr) return { ok: false, error: compErr.message };

    return {
      ok: true,
      data: {
        members,
        completions: (completionRows ?? []) as CompletionRow[],
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}

const MOTIVATION_MAX_LEN = 500;

export async function updateMyTeamMotivationAction(
  teamId: string,
  note: string,
): Promise<ActionResult<{ motivationNote: string | null }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Je bent niet ingelogd." };

    const trimmed = note.trim().slice(0, MOTIVATION_MAX_LEN);
    const value = trimmed.length ? trimmed : null;

    const { data: membership, error: memErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) return { ok: false, error: memErr.message };
    if (!membership) return { ok: false, error: "Je zit niet in dit team." };

    const { error } = await supabase
      .from("team_members")
      .update({ motivation_note: value })
      .eq("team_id", teamId)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/");
    return { ok: true, data: { motivationNote: value } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}
