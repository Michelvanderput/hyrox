"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, PanInfo } from "framer-motion";

import { TOTAL_WEEKS } from "@/lib/constants";
import {
  formatWeekDateRangeNl,
  generateWeek,
  getCurrentWeekNumber,
  getPhaseForWeek,
} from "@/lib/training-plan";
import { useTrackerStore } from "@/lib/store";

import { PhaseBanner } from "@/components/dashboard/PhaseBanner";
import { WeekSelector } from "@/components/plan/WeekSelector";
import { DayRow } from "@/components/plan/DayRow";

export function PlanClient({
  initialWeekFromUrl,
}: {
  initialWeekFromUrl?: number;
} = {}) {
  const reduce = useReducedMotion();
  const selectedWeek = useTrackerStore((s) => s.selectedWeek);
  const setSelectedWeek = useTrackerStore((s) => s.setSelectedWeek);
  const getDayOrderForWeek = useTrackerStore((s) => s.getDayOrderForWeek);
  const swapWeekDayVisualPositions = useTrackerStore((s) => s.swapWeekDayVisualPositions);
  const resetWeekDayOrder = useTrackerStore((s) => s.resetWeekDayOrder);
  const appliedUrlWeek = useRef(false);
  const cw = getCurrentWeekNumber();
  const phase = getPhaseForWeek(selectedWeek);
  const days = generateWeek(selectedWeek);
  const dayOrder = getDayOrderForWeek(selectedWeek, days.length);

  const [swapPickVisual, setSwapPickVisual] = useState<number | null>(null);

  const clearSwapPick = useCallback(() => setSwapPickVisual(null), []);

  const onSwapTap = useCallback(
    (visualIndex: number) => {
      if (swapPickVisual === null) {
        setSwapPickVisual(visualIndex);
        return;
      }
      if (swapPickVisual === visualIndex) {
        setSwapPickVisual(null);
        return;
      }
      swapWeekDayVisualPositions(selectedWeek, swapPickVisual, visualIndex);
      setSwapPickVisual(null);
    },
    [selectedWeek, swapPickVisual, swapWeekDayVisualPositions],
  );

  useEffect(() => {
    if (appliedUrlWeek.current) return;
    if (initialWeekFromUrl == null || Number.isNaN(initialWeekFromUrl)) return;
    if (initialWeekFromUrl >= 1 && initialWeekFromUrl <= TOTAL_WEEKS) {
      setSelectedWeek(initialWeekFromUrl);
    }
    appliedUrlWeek.current = true;
  }, [initialWeekFromUrl, setSelectedWeek]);

  const go = (delta: number) => {
    clearSwapPick();
    setSelectedWeek(selectedWeek + delta);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (reduce) return;
    const x = info.offset.x + info.velocity.x * 0.2;
    if (x < -70) go(1);
    else if (x > 70) go(-1);
  };

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="font-heading text-2xl font-black tracking-tight">
          <span
            className="bg-gradient-to-r from-cyan via-neon to-neon-hot bg-clip-text text-transparent"
          >
            Weekplan
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          {phase.label} · swipe om week te wisselen ·{" "}
          <span className="text-faint">↔ = dagen ruilen</span>
        </p>
        {swapPickVisual !== null && (
          <p className="mt-2 rounded-xl border border-gold/35 bg-gold/10 px-3 py-2 text-xs text-ink">
            Tik <span className="font-semibold">↔</span> op een andere dag om te ruilen, of nogmaals
            op dezelfde om te annuleren.
          </p>
        )}
        <p className="mt-3 rounded-xl border border-edge bg-canvas px-3 py-2.5 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">Terugwerkend afvinken:</span> met{" "}
          <span className="font-semibold text-ink">← Vorige</span> ga je naar eerdere trainingsweken
          en kun je alsnog vinkjes zetten of intrekken — ook voor dagen die je bent vergeten. Met team
          syncen we alleen jouw eigen slot naar de cloud.
        </p>
      </header>

      <PhaseBanner weekNumber={selectedWeek} />

      <p className="text-[13px] text-muted">
        <span className="font-semibold text-ink">Week {selectedWeek}</span>
        <span className="text-faint"> · </span>
        {formatWeekDateRangeNl(selectedWeek, days.length)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="hyrox-btn-primary min-h-11 rounded-full px-4 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => {
            clearSwapPick();
            setSelectedWeek(cw);
          }}
        >
          Deze week
        </button>
        <button
          type="button"
          className="hyrox-btn-ghost min-h-11 rounded-full px-4 text-xs font-semibold text-muted hover:text-ink disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => go(-1)}
          disabled={selectedWeek <= 1}
        >
          ← Vorige
        </button>
        <button
          type="button"
          className="hyrox-btn-ghost min-h-11 rounded-full px-4 text-xs font-semibold text-muted hover:text-ink disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => go(1)}
          disabled={selectedWeek >= TOTAL_WEEKS}
        >
          Volgende →
        </button>
        <button
          type="button"
          className="hyrox-btn-ghost min-h-11 rounded-full px-4 text-xs font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => resetWeekDayOrder(selectedWeek)}
          title="Weekvolgorde terug naar schema"
        >
          Reset weekvolgorde
        </button>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Week 1–{TOTAL_WEEKS}
        </div>
        <WeekSelector
          currentCalendarWeek={cw}
          selectedWeek={selectedWeek}
          onSelect={(w) => {
            clearSwapPick();
            setSelectedWeek(w);
          }}
        />
      </div>

      <motion.div
        key={selectedWeek}
        drag={reduce ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        initial={reduce ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="space-y-2.5"
      >
        {dayOrder.map((origDi, visualIndex) => {
          const d = days[origDi]!;
          return (
            <DayRow
              key={`${selectedWeek}-${origDi}`}
              weekNumber={selectedWeek}
              dayIndex={origDi}
              workout={d}
              visualIndex={visualIndex}
              swapPickVisual={swapPickVisual}
              onSwapTap={onSwapTap}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
