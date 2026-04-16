"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/types";
import type { NotificationSettings } from "@/lib/push";

export async function getMyPushSettingsAction(): Promise<
  ActionResult<{ settings: NotificationSettings | null }>
> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: true, data: { settings: null } };

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select(
        "workout_reminder_enabled,workout_reminder_time,creatine_reminder_enabled,creatine_reminder_time,teammate_workout_enabled,teammate_message_enabled",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: true, data: { settings: null } };

    return {
      ok: true,
      data: {
        settings: {
          workout_reminder_enabled: data.workout_reminder_enabled,
          workout_reminder_time: data.workout_reminder_time,
          creatine_reminder_enabled: data.creatine_reminder_enabled,
          creatine_reminder_time: data.creatine_reminder_time,
          teammate_workout_enabled: data.teammate_workout_enabled,
          teammate_message_enabled: data.teammate_message_enabled,
        },
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}

export async function sendPushToTeammateAction(
  teamId: string,
  payload: { title: string; body: string; tag: string; url: string },
  filterColumn: "teammate_workout_enabled" | "teammate_message_enabled",
): Promise<ActionResult<{ sent: number }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niet ingelogd." };

    const { data: members, error: memErr } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId)
      .neq("user_id", user.id);

    if (memErr) return { ok: false, error: memErr.message };
    if (!members?.length) return { ok: true, data: { sent: 0 } };

    const teammateIds = members.map((m) => m.user_id);

    const { data: subs, error: subErr } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", teammateIds)
      .eq(filterColumn, true);

    if (subErr) return { ok: false, error: subErr.message };
    if (!subs?.length) return { ok: true, data: { sent: 0 } };

    const webpush = await import("web-push");
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:hyrox@example.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      return { ok: false, error: "VAPID keys niet geconfigureerd." };
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        ),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return { ok: true, data: { sent } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return { ok: false, error: msg };
  }
}
