"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import type { DayWorkout } from "@/types";
import { formatScheduledDayNl } from "@/lib/training-plan";
import { canEditAthleteSlot, resolveMyAthleteIndex } from "@/lib/athlete-ui";
import { completionKey } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";
import { appToast } from "@/lib/toast-store";
import { pushCompletionSnapshot } from "@/lib/sync/push-completion";

export function CompletionDrawer({
  open,
  onClose,
  weekNumber,
  dayIndex,
  workout,
}: {
  open: boolean;
  onClose: () => void;
  weekNumber: number;
  dayIndex: number;
  workout: DayWorkout | null;
}) {
  const reduce = useReducedMotion();
  const names = useTrackerStore((s) => s.athleteNames);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);
  const viewerUserId = useTrackerStore((s) => s.viewerUserId);
  const completionMeta = useTrackerStore((s) => s.completionMeta);
  const setCompletionMeta = useTrackerStore((s) => s.setCompletionMeta);
  const [localWho, setLocalWho] = useState<0 | 1>(0);

  const myAthlete = useMemo(
    () => resolveMyAthleteIndex(memberUserIds, viewerUserId),
    [memberUserIds, viewerUserId],
  );
  const who: 0 | 1 = myAthlete !== null ? myAthlete : localWho;

  const rowKey = completionKey(who, weekNumber, dayIndex);
  const meta = completionMeta[rowKey] ?? {};

  const canEditWho = canEditAthleteSlot(viewerUserId, activeTeamId, memberUserIds, who);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!workout) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Sluiten"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-drawer-title"
            className="relative z-10 w-full max-w-lg rounded-t-3xl border border-edge bg-panel p-5 shadow-2xl sm:rounded-3xl"
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-edge-hover sm:hidden" />
            <h2 id="completion-drawer-title" className="font-heading text-lg font-bold">
              Workout log
            </h2>
            <p className="mt-1 text-sm text-muted">
              {workout.dayLabel}{" "}
              <span className="text-faint">·</span> {formatScheduledDayNl(weekNumber, dayIndex)}{" "}
              <span className="text-faint">·</span> week {weekNumber}
              <span className="text-faint"> — </span>
              {workout.title}
            </p>

            <div className="mt-3 max-h-[38vh] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-canvas/90 p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Training</p>
              <p className="text-sm leading-relaxed text-muted">{workout.description}</p>
              {workout.detail ? (
                <>
                  <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-neon-hot/90">
                    Stappen & uitleg
                  </p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink/90">
                    {workout.detail}
                  </p>
                </>
              ) : null}
              <p className="text-[11px] text-faint">⏱ {workout.durationLabel}</p>
            </div>

            {myAthlete === null ? (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-edge bg-canvas p-1">
                {([0, 1] as const).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLocalWho(i)}
                    className={`min-h-11 rounded-lg text-sm font-semibold transition ${
                      who === i
                        ? i === 0
                          ? "bg-run/15 text-run"
                          : "bg-station/15 text-station"
                        : "text-muted"
                    }`}
                  >
                    {names[i] || `Teamlid ${i === 0 ? "A" : "B"}`}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-edge bg-canvas px-3 py-2.5 text-sm text-muted">
                Je logt voor{" "}
                <span className="font-semibold text-ink">{names[myAthlete] || "jezelf"}</span>
              </p>
            )}

            <div className="mt-4 space-y-3" key={rowKey}>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Rating (1–5)
                </label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-sm font-bold transition ${
                        (meta.rating ?? 0) >= star
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-edge text-muted hover:border-edge-hover"
                      }`}
                      disabled={!canEditWho}
                      onClick={() =>
                        setCompletionMeta(who, weekNumber, dayIndex, {
                          ...meta,
                          rating: star,
                        })
                      }
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="dur"
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted"
                >
                  Werkelijke duur (min)
                </label>
                <input
                  id="dur"
                  inputMode="numeric"
                  disabled={!canEditWho}
                  className="mt-2 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm outline-none focus:border-gold disabled:opacity-40"
                  placeholder="Optioneel"
                  defaultValue={meta.actualDurationMin ?? ""}
                  onBlur={(e) => {
                    if (!canEditWho) return;
                    const v = e.target.value.trim();
                    const n = v === "" ? undefined : Number(v);
                    setCompletionMeta(who, weekNumber, dayIndex, {
                      ...meta,
                      actualDurationMin: Number.isFinite(n) ? n : undefined,
                    });
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted"
                >
                  Notities
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  disabled={!canEditWho}
                  className="mt-2 w-full resize-none rounded-xl border border-edge bg-canvas px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-40"
                  placeholder="Hoe voelde het? Wat ging goed?"
                  defaultValue={meta.notes ?? ""}
                  onBlur={(e) => {
                    if (!canEditWho) return;
                    setCompletionMeta(who, weekNumber, dayIndex, {
                      ...meta,
                      notes: e.target.value.trim() || undefined,
                    });
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full min-h-11 rounded-xl bg-gold font-semibold text-canvas"
              onClick={() => {
                void (async () => {
                  if (viewerUserId && activeTeamId && memberUserIds[who] === viewerUserId) {
                    const res = await pushCompletionSnapshot({
                      userId: viewerUserId,
                      athleteIndex: who,
                      weekNumber,
                      dayIndex,
                    });
                    if (!res.ok) {
                      appToast.error(res.error);
                      return;
                    }
                  }
                  onClose();
                })();
              }}
            >
              Klaar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
