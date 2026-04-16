"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

const STORAGE_KEY = "hyrox-creatine-checks";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveChecks(checks: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
}

export function CreatineTracker() {
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checks = loadChecks();
    const today = todayKey();
    setChecked(!!checks[today]);

    let s = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (checks[d.toISOString().slice(0, 10)]) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    if (checks[today]) s++;
    setStreak(s);
  }, []);

  const toggle = () => {
    const checks = loadChecks();
    const today = todayKey();
    const next = !checks[today];
    checks[today] = next;
    saveChecks(checks);
    setChecked(next);

    let s = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (checks[d.toISOString().slice(0, 10)]) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    if (next) s++;
    setStreak(s);
  };

  if (!mounted) return null;

  return (
    <div className="hyrox-card flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          💊
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Vandaag
          </p>
          <p className="font-heading text-sm font-bold text-ink">Creatine</p>
          {streak > 0 && (
            <p className="mt-0.5 text-[10px] text-neon">
              🔥 {streak} dag{streak !== 1 ? "en" : ""} op rij
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        className="shrink-0 transition active:scale-95"
        aria-label={checked ? "Creatine afgevinkt, klik om ongedaan te maken" : "Creatine afvinken"}
      >
        {checked ? (
          <CheckCircle2 className="size-8 text-neon drop-shadow-[0_0_8px_rgba(163,255,51,0.6)]" />
        ) : (
          <Circle className="size-8 text-muted" />
        )}
      </button>
    </div>
  );
}
