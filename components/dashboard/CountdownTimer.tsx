"use client";

import { useEffect, useState } from "react";

import { RACE_CONFIG, EVENT_UI } from "@/lib/constants";
import { formatRaceCountdown } from "@/lib/utils";

const RACE_AT = new Date(`${RACE_CONFIG.date}T08:00:00`);

export function CountdownTimer() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { d, h, m, s } = formatRaceCountdown(RACE_AT.getTime() - now);
  const units = [
    { v: d, l: "dagen" },
    { v: h, l: "uur" },
    { v: m, l: "min" },
    { v: s, l: "sec" },
  ] as const;

  return (
    <div className="hyrox-card hyrox-glow relative overflow-hidden p-4 sm:p-5">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-neon/10"
        aria-hidden
      />
      <div className="relative">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Race day countdown
        </div>
        <div className="mt-3 flex justify-between gap-2 sm:gap-4">
          {units.map((u) => (
            <div key={u.l} className="flex-1 text-center">
              <div
                className="font-heading text-2xl font-extrabold leading-none tabular-nums sm:text-3xl"
                style={{
                  backgroundImage: "linear-gradient(180deg, #fafafa, #a3ff33)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {String(u.v).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[9px] font-medium uppercase tracking-wide text-faint">
                {u.l}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted">{EVENT_UI.dateLineLong}</p>
      </div>
    </div>
  );
}
