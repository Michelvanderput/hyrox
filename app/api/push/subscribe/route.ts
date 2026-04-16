import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys, settings } = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      settings?: {
        workout_reminder_enabled?: boolean;
        workout_reminder_time?: string;
        creatine_reminder_enabled?: boolean;
        creatine_reminder_time?: string;
        teammate_workout_enabled?: boolean;
        teammate_message_enabled?: boolean;
      };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Ongeldige subscription data." }, { status: 400 });
    }

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        ...(settings?.workout_reminder_enabled !== undefined && {
          workout_reminder_enabled: settings.workout_reminder_enabled,
        }),
        ...(settings?.workout_reminder_time !== undefined && {
          workout_reminder_time: settings.workout_reminder_time,
        }),
        ...(settings?.creatine_reminder_enabled !== undefined && {
          creatine_reminder_enabled: settings.creatine_reminder_enabled,
        }),
        ...(settings?.creatine_reminder_time !== undefined && {
          creatine_reminder_time: settings.creatine_reminder_time,
        }),
        ...(settings?.teammate_workout_enabled !== undefined && {
          teammate_workout_enabled: settings.teammate_workout_enabled,
        }),
        ...(settings?.teammate_message_enabled !== undefined && {
          teammate_message_enabled: settings.teammate_message_enabled,
        }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body as { endpoint: string };

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
