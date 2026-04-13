"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  PR_STATION_IDS,
  PR_STATION_LABELS,
  type PRStationId,
} from "@/lib/constants";
import { formatSeconds } from "@/lib/utils";
import { useTrackerStore } from "@/lib/store";

export function PRDashboard() {
  const names = useTrackerStore((s) => s.athleteNames);
  const prEntries = useTrackerStore((s) => s.prEntries);
  const addPr = useTrackerStore((s) => s.addPr);
  const removePr = useTrackerStore((s) => s.removePr);

  const [stationId, setStationId] = useState<PRStationId>("ski");
  const [athlete, setAthlete] = useState<0 | 1>(0);
  const [chartAthlete, setChartAthlete] = useState<0 | 1>(0);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const chartData = useMemo(() => {
    return prEntries
      .filter((e) => e.stationId === stationId && e.athleteIndex === chartAthlete)
      .slice()
      .reverse()
      .map((e) => ({
        t: new Date(e.recordedAt).toLocaleDateString("nl-NL", {
          day: "2-digit",
          month: "short",
        }),
        value: e.value,
      }));
  }, [prEntries, stationId, chartAthlete]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) return;
    addPr({ athleteIndex: athlete, stationId, value: v, notes: notes.trim() || undefined });
    setValue("");
    setNotes("");
  };

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h1 className="font-heading text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan via-neon to-run bg-clip-text text-transparent">
            Personal records
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Log tijden (seconden) om trends te zien. Later: sync met Supabase + vergelijk met partner.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-edge bg-panel p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Atleet
            <select
              className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
              value={athlete}
              onChange={(e) => setAthlete(Number(e.target.value) as 0 | 1)}
            >
              <option value={0}>{names[0]}</option>
              <option value={1}>{names[1]}</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Station / test
            <select
              className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
              value={stationId}
              onChange={(e) => setStationId(e.target.value as PRStationId)}
            >
              {PR_STATION_IDS.map((id) => (
                <option key={id} value={id}>
                  {PR_STATION_LABELS[id]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Waarde (seconden)
          <input
            required
            inputMode="decimal"
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Bijv. 245 (= 4:05)"
          />
        </label>
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Notities (optioneel)
          <input
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas"
        >
          Opslaan
        </button>
      </form>

      <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-sm font-bold">Trend</h2>
            <p className="text-[11px] text-muted">
              {PR_STATION_LABELS[stationId]} · {names[chartAthlete]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="min-h-11 rounded-xl border border-edge bg-canvas px-3 text-xs font-semibold"
              value={stationId}
              onChange={(e) => setStationId(e.target.value as PRStationId)}
            >
              {PR_STATION_IDS.map((id) => (
                <option key={id} value={id}>
                  {PR_STATION_LABELS[id]}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-xl border border-edge bg-canvas px-3 text-xs font-semibold"
              value={chartAthlete}
              onChange={(e) => setChartAthlete(Number(e.target.value) as 0 | 1)}
            >
              <option value={0}>{names[0]}</option>
              <option value={1}>{names[1]}</option>
            </select>
          </div>
        </div>
        <div className="mt-4 h-56 w-full min-w-0 min-h-56">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted">Nog geen PR’s voor deze selectie.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#16161e" vertical={false} />
                <XAxis dataKey="t" stroke="#555" tick={{ fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0e0e16",
                    border: "1px solid #16161e",
                    borderRadius: 12,
                    color: "#e4e4ec",
                    fontSize: 12,
                  }}
                  formatter={(val) =>
                    typeof val === "number" ? formatSeconds(val) : String(val ?? "")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartAthlete === 0 ? "var(--accent-blue)" : "var(--accent-pink)"}
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Recent</h2>
        <ul className="mt-3 space-y-2">
          {prEntries.slice(0, 12).map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-canvas px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">
                  {names[e.athleteIndex]} ·{" "}
                  {PR_STATION_LABELS[e.stationId as PRStationId] ?? e.stationId}
                </div>
                <div className="text-[11px] text-muted">
                  {new Date(e.recordedAt).toLocaleString("nl-NL")}{" "}
                  {e.notes ? `· ${e.notes}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold text-gold">
                  {formatSeconds(e.value)}
                </span>
                <button
                  type="button"
                  className="min-h-9 rounded-lg border border-edge-hover px-2 text-[11px] text-muted hover:text-race"
                  onClick={() => removePr(e.id)}
                >
                  Verwijder
                </button>
              </div>
            </li>
          ))}
          {prEntries.length === 0 && (
            <li className="text-sm text-muted">Nog geen logs — voeg je eerste PR toe.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
