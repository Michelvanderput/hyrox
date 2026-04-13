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
  PR_STATION_IDS_GYM,
  PR_STATION_IDS_HYROX,
  PR_STATION_LABELS,
  PR_STATION_UNITS,
  type PRStationId,
} from "@/lib/constants";
import { resolveMyAthleteIndex, canEditAthleteSlot } from "@/lib/athlete-ui";
import { formatPrValue, prValueUnitLabel } from "@/lib/pr-format";
import { useTrackerStore } from "@/lib/store";

function PrStationSelect({
  value,
  onChange,
  className,
}: {
  value: PRStationId;
  onChange: (id: PRStationId) => void;
  className?: string;
}) {
  return (
    <select
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as PRStationId)}
    >
      <optgroup label="HYROX (tijd)">
        {PR_STATION_IDS_HYROX.map((id) => (
          <option key={id} value={id}>
            {PR_STATION_LABELS[id]} · sec
          </option>
        ))}
      </optgroup>
      <optgroup label="Gym (gewicht)">
        {PR_STATION_IDS_GYM.map((id) => (
          <option key={id} value={id}>
            {PR_STATION_LABELS[id]} · kg
          </option>
        ))}
      </optgroup>
    </select>
  );
}

function parsePrInput(raw: string): number | null {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function PRDashboard() {
  const names = useTrackerStore((s) => s.athleteNames);
  const prEntries = useTrackerStore((s) => s.prEntries);
  const addPr = useTrackerStore((s) => s.addPr);
  const removePr = useTrackerStore((s) => s.removePr);
  const viewerUserId = useTrackerStore((s) => s.viewerUserId);
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);

  const myAthlete = useMemo(
    () => resolveMyAthleteIndex(memberUserIds, viewerUserId),
    [memberUserIds, viewerUserId],
  );
  const cloudLocksPrAthlete = !!(viewerUserId && activeTeamId);
  const [localPrAthlete, setLocalPrAthlete] = useState<0 | 1>(0);
  const athleteForForm: 0 | 1 = cloudLocksPrAthlete && myAthlete !== null ? myAthlete : localPrAthlete;

  const [stationId, setStationId] = useState<PRStationId>("ski");
  /** `null` = toon standaard jezelf (cloud) of atleet 0 (lokaal). */
  const [chartAthletePick, setChartAthletePick] = useState<0 | 1 | null>(null);
  const chartAthlete: 0 | 1 = useMemo(() => {
    if (chartAthletePick !== null) return chartAthletePick;
    if (cloudLocksPrAthlete && myAthlete !== null) return myAthlete;
    return 0;
  }, [chartAthletePick, cloudLocksPrAthlete, myAthlete]);

  const partnerAthlete: 0 | 1 | null =
    cloudLocksPrAthlete && myAthlete !== null ? (myAthlete === 0 ? 1 : 0) : null;

  const partnerPrFeed = useMemo(() => {
    if (partnerAthlete === null) return [];
    return prEntries.filter((e) => e.athleteIndex === partnerAthlete).slice(0, 10);
  }, [prEntries, partnerAthlete]);

  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const valueUnit = PR_STATION_UNITS[stationId];

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
    const v = parsePrInput(value);
    if (v === null) return;
    if (cloudLocksPrAthlete && myAthlete === null) return;
    addPr({
      athleteIndex: athleteForForm,
      stationId,
      value: v,
      notes: notes.trim() || undefined,
    });
    setValue("");
    setNotes("");
  };

  const canRemovePr = (athleteIndex: 0 | 1) =>
    canEditAthleteSlot(viewerUserId, activeTeamId, memberUserIds, athleteIndex);

  const yTick = (v: number) =>
    valueUnit === "kg" ? `${v}` : formatPrValue(stationId, v);

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h1 className="font-heading text-2xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan via-neon to-run bg-clip-text text-transparent">
            Personal records
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          HYROX in <span className="font-semibold text-ink">seconden</span>, gym in{" "}
          <span className="font-semibold text-ink">kg</span> (1RM of zwaarste nette set). Alles lokaal
          in de browser. Met team voeg jij alleen <span className="font-semibold text-ink">eigen</span>{" "}
          logs toe; je teamgenoot zie je in de trend, recente lijst en hieronder.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-edge bg-panel p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {cloudLocksPrAthlete && myAthlete !== null ? (
            <div className="space-y-1 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Voor wie</p>
              <p className="mt-1 min-h-11 rounded-xl border border-edge bg-canvas px-3 py-2.5 text-sm font-semibold text-ink">
                {names[myAthlete] || "Jij"}
              </p>
            </div>
          ) : cloudLocksPrAthlete && myAthlete === null ? (
            <>
              <p className="rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-muted sm:col-span-2">
                Je zit in een team maar je slot is nog niet gekoppeld — PR’s toevoegen lukt pas als je
                teamlidmaatschap actief is.
              </p>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted sm:col-span-2">
                Oefening
                <PrStationSelect
                  value={stationId}
                  onChange={setStationId}
                  className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
                />
              </label>
            </>
          ) : (
            <>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Teamlid (lokaal)
                <select
                  className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
                  value={localPrAthlete}
                  onChange={(e) => setLocalPrAthlete(Number(e.target.value) as 0 | 1)}
                >
                  <option value={0}>{names[0]}</option>
                  <option value={1}>{names[1]}</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Oefening
                <PrStationSelect
                  value={stationId}
                  onChange={setStationId}
                  className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
                />
              </label>
            </>
          )}
          {cloudLocksPrAthlete && myAthlete !== null ? (
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Oefening
              <PrStationSelect
                value={stationId}
                onChange={setStationId}
                className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink"
              />
            </label>
          ) : null}
        </div>
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Waarde ({prValueUnitLabel(stationId)})
          <input
            required
            inputMode="decimal"
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              valueUnit === "kg" ? "Bijv. 100 of 102,5" : "Bijv. 245 (= 4:05 als tijd in sec)"
            }
          />
        </label>
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Notities (optioneel)
          <input
            className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bijv. touch-and-go, meetlint, wedstrijd"
          />
        </label>
        <button
          type="submit"
          disabled={cloudLocksPrAthlete && myAthlete === null}
          className="w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-45"
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
              {cloudLocksPrAthlete && myAthlete !== null && chartAthlete !== myAthlete
                ? " · teamgenoot (alleen bekijken)"
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PrStationSelect
              value={stationId}
              onChange={setStationId}
              className="min-h-11 max-w-[min(100%,220px)] rounded-xl border border-edge bg-canvas px-2 text-[11px] font-semibold sm:max-w-xs sm:px-3 sm:text-xs"
            />
            <select
              className="min-h-11 rounded-xl border border-edge bg-canvas px-3 text-xs font-semibold"
              value={chartAthlete}
              onChange={(e) => {
                const v = Number(e.target.value) as 0 | 1;
                if (cloudLocksPrAthlete && myAthlete !== null && v === myAthlete) {
                  setChartAthletePick(null);
                } else {
                  setChartAthletePick(v);
                }
              }}
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
                <YAxis stroke="#555" tick={{ fontSize: 10 }} tickFormatter={yTick} />
                <Tooltip
                  contentStyle={{
                    background: "#0e0e16",
                    border: "1px solid #16161e",
                    borderRadius: 12,
                    color: "#e4e4ec",
                    fontSize: 12,
                  }}
                  formatter={(val) =>
                    typeof val === "number" ? formatPrValue(stationId, val) : String(val ?? "")
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

      {partnerAthlete !== null && partnerPrFeed.length > 0 ? (
        <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
          <h2 className="font-heading text-sm font-bold">Teamgenoot (laatste logs)</h2>
          <p className="mt-1 text-[11px] text-muted">
            {names[partnerAthlete] || "Partner"} — ter inzicht; verwijderen kan alleen op eigen
            toestel.
            {cloudLocksPrAthlete
              ? " PR’s syncen nog niet naar de cloud: je ziet hier alleen wat op dit apparaat voor hun plek staat (bijv. gedeelde tablet)."
              : null}
          </p>
          <ul className="mt-3 space-y-2">
            {partnerPrFeed.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-canvas px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">
                    {PR_STATION_LABELS[e.stationId as PRStationId] ?? e.stationId}
                  </div>
                  <div className="text-[11px] text-muted">
                    {new Date(e.recordedAt).toLocaleString("nl-NL")}
                    {e.notes ? ` · ${e.notes}` : ""}
                  </div>
                </div>
                <span className="shrink-0 font-heading text-base font-bold text-gold">
                  {formatPrValue(e.stationId, e.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold">Recent (alles op dit apparaat)</h2>
        <ul className="mt-3 space-y-2">
          {prEntries.slice(0, 16).map((e) => (
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
                  {formatPrValue(e.stationId, e.value)}
                </span>
                {canRemovePr(e.athleteIndex) ? (
                  <button
                    type="button"
                    className="min-h-9 rounded-lg border border-edge-hover px-2 text-[11px] text-muted hover:text-race"
                    onClick={() => removePr(e.id)}
                  >
                    Verwijder
                  </button>
                ) : (
                  <span className="text-[10px] text-faint">—</span>
                )}
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
