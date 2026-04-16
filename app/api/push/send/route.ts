import { NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:hyrox@example.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export type PushPayload = {
  title: string;
  body: string;
  tag?: string;
  url?: string;
};

export type SendPushInput = {
  /** Stuur naar specifieke user IDs */
  userIds: string[];
  payload: PushPayload;
};

export async function POST(req: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: "VAPID keys niet geconfigureerd." }, { status: 500 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
    }

    const body = (await req.json()) as SendPushInput;
    const { userIds, payload } = body;

    if (!userIds?.length || !payload) {
      return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
    }

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = await Promise.allSettled(
      (subs ?? []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        ),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ ok: true, sent, failed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
