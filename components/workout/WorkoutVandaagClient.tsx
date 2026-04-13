"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { resolveTodayWorkout } from "@/lib/today-workout";
import { getWorkoutExtraCopy } from "@/lib/workout-detail-copy";
import { WORKOUT_TYPE_META } from "@/lib/workout-styles";
import { completionKey } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";
import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { pushCompletionSnapshot } from "@/lib/sync/push-completion";
import { appToast } from "@/lib/toast-store";
import { trackEvent } from "@/lib/analytics";

import { NeonProgressBar } from "@/components/ui/NeonProgressBar";

export function WorkoutVandaagClient() {
  const reduce = useReducedMotion();
  const { userId } = useTrainingCloud();
  const ctx = useMemo(() => resolveTodayWorkout(), []);
  const { weekNumber, dayIndex, workout, phaseLabel, dateLabel } = ctx;
  const extra = getWorkoutExtraCopy(workout.type);
  const style = WORKOUT_TYPE_META[workout.type];

  const names = useTrackerStore((s) => s.athleteNames);
  const completions = useTrackerStore((s) => s.completions);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);
  const toggleCompletion = useTrackerStore((s) => s.toggleCompletion);
  const getWeekProgress = useTrackerStore((s) => s.getWeekProgress);

  const [burst, setBurst] = useState(false);

  const workspaceReady = !!(
    activeTeamId &&
    (memberUserIds[0] !== null || memberUserIds[1] !== null)
  );

  const canEditAthlete = useCallback(
    (athlete: 0 | 1) => {
      if (!userId || !workspaceReady) return true;
      const mid = memberUserIds[athlete];
      if (!mid) return false;
      return mid === userId;
    },
    [memberUserIds, userId, workspaceReady],
  );

  const w0 = getWeekProgress(0, weekNumber);
  const w1 = getWeekProgress(1, weekNumber);
  const weekPct =
    w0.total > 0 ? Math.round(((w0.done + w1.done) / (2 * w0.total)) * 100) : 0;

  useEffect(() => {
    trackEvent("workout_vandaag_view", { week: weekNumber, day: dayIndex });
  }, [weekNumber, dayIndex]);

  const onToggle = useCallback(
    (athlete: 0 | 1) => {
      if (!canEditAthlete(athlete)) return;
      const key = completionKey(athlete, weekNumber, dayIndex);
      const next = !useTrackerStore.getState().completions[key];
      toggleCompletion(athlete, weekNumber, dayIndex);
      trackEvent("completion_toggle", {
        location: "workout_vandaag",
        week: weekNumber,
        day: dayIndex,
        athlete,
        completed: next,
      });
      if (next && !reduce) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 650);
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate(12);
          } catch {
            /* ignore */
          }
        }
      }
      if (userId && workspaceReady && memberUserIds[athlete] === userId) {
        void (async () => {
          const res = await pushCompletionSnapshot({
            userId,
            athleteIndex: athlete,
            weekNumber,
            dayIndex,
          });
          if (!res.ok) {
            toggleCompletion(athlete, weekNumber, dayIndex);
            appToast.error(res.error);
          }
        })();
      }
    },
    [
      canEditAthlete,
      dayIndex,
      memberUserIds,
      reduce,
      toggleCompletion,
      userId,
      weekNumber,
      workspaceReady,
    ],
  );

  return (
    <div className="space-y-5 pb-6">
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Workout van de dag
        </p>
        <h1 className="font-heading text-2xl font-black tracking-tight capitalize text-ink">
          {dateLabel}
        </h1>
        <p className="text-sm text-muted">
          Week {weekNumber} · {phaseLabel} · {workout.dayLabel}
        </p>
      </header>

      <article className={`hyrox-card relative overflow-hidden p-4 sm:p-5 ${style.border} ${style.bg}`}>
        {burst && (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-6xl"
            >
              ✓
            </motion.span>
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.border} ${style.text}`}
          >
            {style.label}
          </span>
          <span className="text-[11px] text-muted">⏱ {workout.durationLabel}</span>
        </div>
        <h2 className="mt-2 font-heading text-xl font-bold text-ink">{workout.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{workout.description}</p>
      </article>

      {workout.detail ? (
        <section className="hyrox-card space-y-2 p-4 sm:p-5">
          <h3 className="font-heading text-sm font-bold text-ink">Stappen & uitleg</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{workout.detail}</p>
        </section>
      ) : null}

      <section className="hyrox-card space-y-3 p-4 sm:p-5">
        <h3 className="font-heading text-sm font-bold text-ink">Extra tips (type)</h3>
        <p className="text-xs font-semibold uppercase tracking-wide text-neon-hot/90">{extra.focus}</p>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted">
          {extra.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        {extra.hyroxNote ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[13px] leading-relaxed text-ink/90">
            <span className="font-semibold text-cyan">HYROX: </span>
            {extra.hyroxNote}
          </p>
        ) : null}
      </section>

      <section className="hyrox-card space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-sm font-bold text-ink">Deze week (samenvatting)</h3>
          <span className="text-xs font-semibold tabular-nums text-muted">{weekPct}%</span>
        </div>
        <NeonProgressBar value={weekPct} />
      </section>

      <section className="hyrox-card p-4 sm:p-5">
        <h3 className="font-heading text-sm font-bold text-ink">Vandaag afvinken</h3>
        <p className="mt-1 text-[11px] text-muted">Zelfde data als in het weekplan. In de cloud alleen je eigen slot.</p>
        <div className="mt-4 flex gap-3">
          {([0, 1] as const).map((ai) => {
            const on = !!completions[completionKey(ai, weekNumber, dayIndex)];
            const col = ai === 0 ? "var(--accent-blue)" : "var(--accent-pink)";
            const editable = canEditAthlete(ai);
            return (
              <div key={ai} className="flex flex-1 flex-col items-center gap-2">
                <motion.button
                  type="button"
                  disabled={!editable}
                  whileTap={reduce || !editable ? undefined : { scale: 0.94 }}
                  className="relative flex size-14 items-center justify-center rounded-2xl border-2 transition disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    borderColor: on ? col : "rgba(255,255,255,0.12)",
                    background: on ? col : "transparent",
                  }}
                  aria-pressed={on}
                  onClick={() => onToggle(ai)}
                >
                  {on && (
                    <span className="text-lg font-black text-canvas" aria-hidden>
                      ✓
                    </span>
                  )}
                </motion.button>
                <span className="max-w-[100px] truncate text-center text-[10px] font-semibold text-muted">
                  {names[ai] || `Teamlid ${ai === 0 ? "A" : "B"}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/plan?week=${weekNumber}`}
          className="hyrox-btn-primary inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-center text-sm font-bold"
          onClick={() => trackEvent("open_weekplan_from_today", { week: weekNumber })}
        >
          Open volledig weekplan
        </Link>
        <Link
          href="/"
          className="hyrox-btn-ghost inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-center text-sm font-semibold"
        >
          Naar home
        </Link>
      </div>
    </div>
  );
}
