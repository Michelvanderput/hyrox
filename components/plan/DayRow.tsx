"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { DayWorkout } from "@/types";
import { completionKey } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";
import { WORKOUT_TYPE_META } from "@/lib/workout-styles";
import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { appToast } from "@/lib/toast-store";
import { pushCompletionSnapshot } from "@/lib/sync/push-completion";

import { CompletionDrawer } from "@/components/plan/CompletionDrawer";

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: ((i * 17) % 80) - 40,
    y: -20 - ((i * 7) % 40),
    rot: ((i * 13) % 120) - 60,
    delay: (i % 10) * 0.02,
  }));
  return (
    <span
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 size-1.5 rounded-sm bg-gold"
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: p.x,
            y: p.y,
            rotate: p.rot,
            scale: 0.4,
          }}
          transition={{ duration: 0.55, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

export function DayRow({
  weekNumber,
  dayIndex,
  workout,
}: {
  weekNumber: number;
  dayIndex: number;
  workout: DayWorkout;
}) {
  const reduce = useReducedMotion();
  const { userId } = useTrainingCloud();
  const names = useTrackerStore((s) => s.athleteNames);
  const completions = useTrackerStore((s) => s.completions);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);
  const toggleCompletion = useTrackerStore((s) => s.toggleCompletion);

  const [drawer, setDrawer] = useState(false);
  const [burst, setBurst] = useState(false);

  const style = WORKOUT_TYPE_META[workout.type];

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

  const onToggle = useCallback(
    (athlete: 0 | 1) => {
      if (!canEditAthlete(athlete)) return;
      const key = completionKey(athlete, weekNumber, dayIndex);
      const next = !useTrackerStore.getState().completions[key];
      toggleCompletion(athlete, weekNumber, dayIndex);
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
    <>
      <motion.article
        layout
        className={`relative grid grid-cols-[44px_1fr_auto] items-center gap-3 overflow-visible rounded-3xl border px-3 py-3 sm:grid-cols-[52px_1fr_auto] sm:px-4 ${style.border} ${style.bg}`}
      >
        <ConfettiBurst active={burst} />
        <button
          type="button"
          className="flex flex-col items-center justify-center text-center"
          onClick={() => setDrawer(true)}
        >
          <span className={`font-heading text-sm font-bold ${style.text}`}>{workout.dayLabel}</span>
          <span className="text-[9px] text-faint">{style.label}</span>
        </button>
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => setDrawer(true)}
        >
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{workout.title}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">{workout.description}</p>
          <p className="mt-1 text-[10px] text-faint">⏱ {workout.durationLabel}</p>
        </button>
        <div className="flex gap-2">
          {([0, 1] as const).map((ai) => {
            const on = !!completions[completionKey(ai, weekNumber, dayIndex)];
            const col = ai === 0 ? "var(--accent-blue)" : "var(--accent-pink)";
            const editable = canEditAthlete(ai);
            return (
              <div key={ai} className="relative flex flex-col items-center gap-1">
                <motion.button
                  type="button"
                  disabled={!editable}
                  whileTap={reduce || !editable ? undefined : { scale: 0.92 }}
                  className="relative flex size-11 items-center justify-center rounded-xl border-2 transition disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    borderColor: on ? col : "var(--border-hover)",
                    background: on ? col : "transparent",
                  }}
                  aria-pressed={on}
                  aria-label={`${names[ai]}: ${on ? "voltooid" : "nog niet"}`}
                  title={!editable ? "Alleen de atleet zelf kan dit afvinken (cloud)" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(ai);
                  }}
                >
                  {on && (
                    <span className="text-sm font-black text-canvas" aria-hidden>
                      ✓
                    </span>
                  )}
                </motion.button>
                <span
                  className="max-w-[52px] truncate text-[9px] font-semibold"
                  style={{ color: col }}
                >
                  {(names[ai] || `A${ai + 1}`).slice(0, 8)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.article>

      <CompletionDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        weekNumber={weekNumber}
        dayIndex={dayIndex}
        workout={workout}
      />
    </>
  );
}
