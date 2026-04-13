"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/types";
import { createTeamAction, joinTeamByCodeAction } from "@/app/actions/team";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type OnboardingTeamInput =
  | { mode: "create"; teamName: string }
  | { mode: "join"; inviteCode: string }
  | { mode: "later" };

function deriveFitnessLevel(
  run: 1 | 2 | 3,
  str: 1 | 2 | 3,
): "beginner" | "intermediate" | "advanced" {
  const a = (run + str) / 2;
  if (a <= 1.66) return "beginner";
  if (a <= 2.33) return "intermediate";
  return "advanced";
}

export async function getMyProfileAction(): Promise<ActionResult<{ profile: ProfileRow | null }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: true, data: { profile: null } };
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: { profile: data as ProfileRow | null } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Profiel ophalen mislukt.";
    return { ok: false, error: msg };
  }
}

export async function completeOnboardingAction(input: {
  name: string;
  gender: "male" | "female" | "other";
  runLevel: 1 | 2 | 3;
  strengthLevel: 1 | 2 | 3;
  team: OnboardingTeamInput;
}): Promise<
  ActionResult<{
    profile: ProfileRow;
    teamId: string | null;
    inviteCode: string | null;
  }>
> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Je bent niet ingelogd." };
    }

    const name = input.name.trim();
    if (name.length < 2) {
      return { ok: false, error: "Vul een naam in (minimaal 2 tekens)." };
    }

    let teamId: string | null = null;
    let inviteCode: string | null = null;

    if (input.team.mode === "create") {
      const tn = input.team.teamName.trim() || "HYROX Duo";
      const created = await createTeamAction(tn);
      if (!created.ok) {
        return { ok: false, error: created.error };
      }
      teamId = created.data.teamId;
      inviteCode = created.data.inviteCode;
    } else if (input.team.mode === "join") {
      const code = input.team.inviteCode.trim().toUpperCase();
      if (code.length < 4) {
        return { ok: false, error: "Vul een geldige teamcode in." };
      }
      const joined = await joinTeamByCodeAction(code);
      if (!joined.ok) {
        return { ok: false, error: joined.error };
      }
      teamId = joined.data.teamId;
    }

    const fitnessLevel = deriveFitnessLevel(input.runLevel, input.strengthLevel);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name,
          gender: input.gender,
          fitness_level: fitnessLevel,
          run_level: input.runLevel,
          strength_level: input.strengthLevel,
          onboarding_completed: true,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Opslaan mislukt." };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/onboarding");
    revalidatePath("/plan");
    return {
      ok: true,
      data: {
        profile: data as ProfileRow,
        teamId,
        inviteCode,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Opslaan mislukt.";
    return { ok: false, error: msg };
  }
}

export async function updateMyProfileBasicsAction(input: {
  name: string;
  gender: "male" | "female" | "other";
  runLevel: 1 | 2 | 3;
  strengthLevel: 1 | 2 | 3;
}): Promise<ActionResult<{ profile: ProfileRow }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Je bent niet ingelogd." };
    }

    const name = input.name.trim();
    if (name.length < 2) {
      return { ok: false, error: "Vul een naam in (minimaal 2 tekens)." };
    }

    const fitnessLevel = deriveFitnessLevel(input.runLevel, input.strengthLevel);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        name,
        gender: input.gender,
        fitness_level: fitnessLevel,
        run_level: input.runLevel,
        strength_level: input.strengthLevel,
      })
      .eq("id", user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data) {
      return { ok: false, error: "Profiel niet gevonden. Probeer opnieuw in te loggen." };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/onboarding");
    return { ok: true, data: { profile: data as ProfileRow } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Opslaan mislukt.";
    return { ok: false, error: msg };
  }
}
