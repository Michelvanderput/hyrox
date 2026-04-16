"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { getMyPushSettingsAction } from "@/app/actions/push";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  updatePushSettings,
  type NotificationSettings,
} from "@/lib/push";
import { appToast } from "@/lib/toast-store";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-neon" : "bg-edge-hover"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-canvas shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-edge bg-canvas px-2 py-1 text-sm text-ink focus:border-neon focus:outline-none disabled:opacity-50"
    />
  );
}

export function NotificationSettings() {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      setLoading(false);
      return;
    }

    const init = async () => {
      const sub = await getPushSubscription();
      setSubscribed(!!sub);

      if (sub) {
        const res = await getMyPushSettingsAction();
        if (res.ok && res.data.settings) {
          setSettings(res.data.settings);
        }
      }

      setLoading(false);
    };

    void init();
  }, []);

  const handleToggleSubscription = () => {
    if (!VAPID_PUBLIC_KEY) {
      appToast.error("VAPID key niet geconfigureerd. Voeg NEXT_PUBLIC_VAPID_PUBLIC_KEY toe.");
      return;
    }

    startTransition(async () => {
      if (subscribed) {
        const res = await unsubscribeFromPush();
        if (res.ok) {
          setSubscribed(false);
          appToast.success("Notificaties uitgeschakeld.");
        } else {
          appToast.error(res.error ?? "Uitschrijven mislukt.");
        }
      } else {
        const res = await subscribeToPush(VAPID_PUBLIC_KEY, settings);
        if (res.ok) {
          setSubscribed(true);
          appToast.success("Notificaties ingeschakeld!");
        } else {
          appToast.error(res.error ?? "Inschrijven mislukt.");
        }
      }
    });
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    const next = { ...settings, [key]: value };
    setSettings(next);

    if (!subscribed) return;
    startTransition(async () => {
      const res = await updatePushSettings({ [key]: value });
      if (!res.ok) {
        appToast.error(res.error ?? "Instelling opslaan mislukt.");
      }
    });
  };

  if (!supported) {
    return (
      <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <BellOff className="size-4 text-muted" />
          <h2 className="font-heading text-sm font-bold">Notificaties</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Push notificaties worden niet ondersteund in deze browser. Voeg de app toe aan je
          beginscherm via Safari voor volledige ondersteuning.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-muted" />
          <h2 className="font-heading text-sm font-bold">Notificaties laden…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-neon" />
          <h2 className="font-heading text-sm font-bold">Notificaties</h2>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={handleToggleSubscription}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
            subscribed
              ? "border border-edge-hover bg-canvas text-muted"
              : "bg-neon text-canvas"
          }`}
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin inline" />
          ) : subscribed ? (
            "Uitschakelen"
          ) : (
            "Inschakelen"
          )}
        </button>
      </div>

      {!subscribed && (
        <p className="text-[11px] text-muted">
          Schakel notificaties in om workout-herinneringen, creatine-reminders en updates van je
          teamgenoot te ontvangen.
        </p>
      )}

      {subscribed && (
        <div className="space-y-4">
          {/* Workout reminder */}
          <div className="rounded-xl border border-edge bg-canvas p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Workout reminder</p>
                <p className="text-[11px] text-muted">Dagelijkse herinnering om te trainen</p>
              </div>
              <Toggle
                checked={settings.workout_reminder_enabled}
                onChange={(v) => handleSettingChange("workout_reminder_enabled", v)}
                disabled={pending}
              />
            </div>
            {settings.workout_reminder_enabled && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted">Tijd:</span>
                <TimeInput
                  value={settings.workout_reminder_time}
                  onChange={(v) => handleSettingChange("workout_reminder_time", v)}
                  disabled={pending}
                />
              </div>
            )}
          </div>

          {/* Creatine reminder */}
          <div className="rounded-xl border border-edge bg-canvas p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Creatine reminder</p>
                <p className="text-[11px] text-muted">Dagelijkse herinnering om creatine te nemen</p>
              </div>
              <Toggle
                checked={settings.creatine_reminder_enabled}
                onChange={(v) => handleSettingChange("creatine_reminder_enabled", v)}
                disabled={pending}
              />
            </div>
            {settings.creatine_reminder_enabled && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted">Tijd:</span>
                <TimeInput
                  value={settings.creatine_reminder_time}
                  onChange={(v) => handleSettingChange("creatine_reminder_time", v)}
                  disabled={pending}
                />
              </div>
            )}
          </div>

          {/* Teamgenoot workout */}
          <div className="rounded-xl border border-edge bg-canvas p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Teamgenoot workout</p>
                <p className="text-[11px] text-muted">
                  Notificatie als je teamgenoot een workout afrondt
                </p>
              </div>
              <Toggle
                checked={settings.teammate_workout_enabled}
                onChange={(v) => handleSettingChange("teammate_workout_enabled", v)}
                disabled={pending}
              />
            </div>
          </div>

          {/* Teamgenoot bericht */}
          <div className="rounded-xl border border-edge bg-canvas p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Teamgenoot bericht</p>
                <p className="text-[11px] text-muted">
                  Notificatie als je teamgenoot een motivatiebericht stuurt
                </p>
              </div>
              <Toggle
                checked={settings.teammate_message_enabled}
                onChange={(v) => handleSettingChange("teammate_message_enabled", v)}
                disabled={pending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
