"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, PanInfo } from "framer-motion";

import { TOTAL_WEEKS } from "@/lib/constants";
import { getPhaseForWeek, generateWeek, getCurrentWeekNumber } from "@/lib/training-plan";
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
  const appliedUrlWeek = useRef(false);
  const cw = getCurrentWeekNumber();
  const phase = getPhaseForWeek(selectedWeek);
  const days = generateWeek(selectedWeek);

  useEffect(() => {
    if (appliedUrlWeek.current) return;
    if (initialWeekFromUrl == null || Number.isNaN(initialWeekFromUrl)) return;
    if (initialWeekFromUrl >= 1 && initialWeekFromUrl <= TOTAL_WEEKS) {
      setSelectedWeek(initialWeekFromUrl);
    }
    appliedUrlWeek.current = true;
  }, [initialWeekFromUrl, setSelectedWeek]);

  const go = (delta: number) => {
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
          Swipe links/rechts om van week te wisselen · {phase.label}
        </p>
      </header>

      <PhaseBanner weekNumber={selectedWeek} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="hyrox-btn-primary min-h-11 rounded-full px-4 text-xs"
          onClick={() => setSelectedWeek(cw)}
        >
          Deze week
        </button>
        <button
          type="button"
          className="hyrox-btn-ghost min-h-11 rounded-full px-4 text-xs font-semibold text-muted hover:text-ink disabled:opacity-35"
          onClick={() => go(-1)}
          disabled={selectedWeek <= 1}
        >
          ← Vorige
        </button>
        <button
          type="button"
          className="hyrox-btn-ghost min-h-11 rounded-full px-4 text-xs font-semibold text-muted hover:text-ink disabled:opacity-35"
          onClick={() => go(1)}
          disabled={selectedWeek >= TOTAL_WEEKS}
        >
          Volgende →
        </button>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Weekkiezer (1–{TOTAL_WEEKS})
        </div>
        <WeekSelector
          currentCalendarWeek={cw}
          selectedWeek={selectedWeek}
          onSelect={setSelectedWeek}
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
        {days.map((d, di) => (
          <DayRow key={d.dayLabel} weekNumber={selectedWeek} dayIndex={di} workout={d} />
        ))}
      </motion.div>
    </div>
  );
}
