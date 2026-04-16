"use client";

export type NotificationSettings = {
  workout_reminder_enabled: boolean;
  workout_reminder_time: string;
  creatine_reminder_enabled: boolean;
  creatine_reminder_time: string;
  teammate_workout_enabled: boolean;
  teammate_message_enabled: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  workout_reminder_enabled: false,
  workout_reminder_time: "08:00",
  creatine_reminder_enabled: false,
  creatine_reminder_time: "09:00",
  teammate_workout_enabled: true,
  teammate_message_enabled: true,
};

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeToPush(
  vapidPublicKey: string,
  settings: Partial<NotificationSettings> = {},
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return { ok: false, error: "Push notificaties worden niet ondersteund in deze browser." };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, error: "Notificatie-toestemming geweigerd." };
    }

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const rawKey = urlBase64ToUint8Array(vapidPublicKey);
    const applicationServerKey = rawKey.buffer.slice(
      rawKey.byteOffset,
      rawKey.byteOffset + rawKey.byteLength,
    ) as ArrayBuffer;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const json = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        settings,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error ?? "Opslaan mislukt." };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." };
  }
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean; error?: string }> {
  try {
    const sub = await getPushSubscription();
    if (!sub) return { ok: true };

    const endpoint = sub.endpoint;
    await sub.unsubscribe();

    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." };
  }
}

export async function updatePushSettings(
  settings: Partial<NotificationSettings>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sub = await getPushSubscription();
    if (!sub) return { ok: false, error: "Geen actieve push subscription gevonden." };

    const json = sub.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        settings,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error ?? "Opslaan mislukt." };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." };
  }
}

export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; tag?: string; url?: string },
): Promise<void> {
  if (!userIds.length) return;
  await fetch("/api/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds, payload }),
  });
}
