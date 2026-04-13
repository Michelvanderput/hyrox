"use client";

import { useEffect, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import type { HyroxStationDef } from "@/lib/constants";
import { formatStationSpec } from "@/lib/format-station";
import { STATION_ENCYCLOPEDIA } from "@/lib/station-encyclopedia";

export function StationDetailModal({
  open,
  onClose,
  station,
  order,
}: {
  open: boolean;
  onClose: () => void;
  station: HyroxStationDef;
  order: number;
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const extra = STATION_ENCYCLOPEDIA[station.id];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Sluiten"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-edge bg-panel p-5 shadow-2xl sm:rounded-3xl"
            initial={reduce ? false : { y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-edge-hover sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="text-2xl" aria-hidden>
                  {station.icon}
                </span>
                <div className="min-w-0">
                  <h2 id={titleId} className="font-heading text-lg font-bold text-ink">
                    <span className="mr-2 text-faint">#{order}</span>
                    {station.name}
                  </h2>
                  <p className="mt-1 text-[11px] text-muted">{formatStationSpec(station)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl border border-edge-hover p-2 text-muted hover:border-gold/40 hover:text-ink"
                aria-label="Sluiten"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-edge bg-canvas px-3 py-2 text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-ink/80">Tip:</span> {station.techniqueTip}
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-[13px] leading-relaxed text-muted">{extra.info}</p>
              {extra.pitfalls ? (
                <p className="text-[12px] leading-relaxed text-muted">
                  <span className="font-semibold text-race/90">Let op:</span> {extra.pitfalls}
                </p>
              ) : null}
              <div>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-gold">
                  Oefeningen die hier goed bij passen
                </h3>
                <ul className="mt-2 space-y-2.5">
                  {extra.exercises.map((ex) => (
                    <li
                      key={ex.name}
                      className="rounded-xl border border-edge bg-canvas px-3 py-2 text-[12px] text-muted"
                    >
                      <span className="font-semibold text-ink">{ex.name}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed">{ex.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas"
            >
              Sluiten
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
