import type { PhaseInfo } from "@/types";

/** Nieuw schema: 22 weken → HYROX race-weekend (startdatum zie TRAINING_START_ISO). */
export const TOTAL_WEEKS = 22;

export const TRAINING_START_ISO = "2026-04-14T06:00:00";

export const RACE_CONFIG = {
  date: "2026-09-20",
  location: "MECC Maastricht",
  totalRunKm: 8,
  totalStations: 8,
  runPerStation: 1,
  averageFinishTime: "1:30:00",
  doublesNote:
    "Partners rennen samen, splitsen stations vrij. 3 min straf bij te ver uit elkaar lopen.",
} as const;

export const HYROX_STATIONS = [
  {
    id: "ski",
    name: "SkiErg",
    distance: "1000m",
    icon: "🎿",
    weights: null,
    techniqueTip:
      "Lange, krachtige halen. Core actief — trek met rug en benen, niet alleen armen.",
  },
  {
    id: "sled_push",
    name: "Sled Push",
    distance: "50m",
    icon: "🛷",
    weights: { men_open: 152, women_open: 102, men_pro: 202, women_pro: 152 },
    techniqueTip: "Laag blijven, korte stappen, duw door je hielen.",
  },
  {
    id: "sled_pull",
    name: "Sled Pull",
    distance: "50m",
    icon: "🪢",
    weights: { men_open: 103, women_open: 78, men_pro: 153, women_pro: 103 },
    techniqueTip: "Hand-over-hand, ritmisch — geen jerks.",
  },
  {
    id: "burpee_bj",
    name: "Burpee Broad Jump",
    distance: "80m",
    icon: "🐸",
    weights: null,
    techniqueTip: "Stap de burpee in waar het kan; focus op voorwaartse beweging.",
  },
  {
    id: "row",
    name: "RowErg",
    distance: "1000m",
    icon: "🚣",
    weights: null,
    techniqueTip: "Damper 5–7: benen → rug → armen, soepele recovery.",
  },
  {
    id: "farmers",
    name: "Farmers Carry",
    distance: "200m",
    icon: "🏋️",
    weights: {
      men_open: "2×24kg",
      women_open: "2×16kg",
      men_pro: "2×32kg",
      women_pro: "2×24kg",
    },
    techniqueTip: "Schouders laag, grip strak, korte snelle passen.",
  },
  {
    id: "lunges",
    name: "Sandbag Lunges",
    distance: "100m",
    icon: "🎒",
    weights: { men_open: 20, women_open: 10, men_pro: 30, women_pro: 20 },
    techniqueTip: "Knie raakt bijna de grond; constant tempo houden.",
  },
  {
    id: "wallballs",
    name: "Wall Balls",
    reps: 100,
    icon: "🏐",
    weights: {
      men_open: "6kg→3.05m",
      women_open: "4kg→2.74m",
      men_pro: "9kg→3.05m",
      women_pro: "6kg→2.74m",
    },
    techniqueTip: "Squat diep, gooi uit de benen, vang laag.",
  },
] as const;

export type HyroxStationDef = (typeof HYROX_STATIONS)[number];

export const PHASES: readonly PhaseInfo[] = [
  {
    id: "FASE1",
    name: "FASE 1",
    label: "Naar je 5 km toe",
    weeks: [1, 2, 3, 4, 5, 6, 7, 8],
    color: "#4ade80",
    description: "April → juni · Conditie opbouwen en comfortabel 5 km lopen (o.a. Maastrichts Mooiste).",
  },
  {
    id: "FASE2",
    name: "FASE 2",
    label: "Start HYROX",
    weeks: [9, 10, 11, 12, 13, 14],
    color: "#d4ff00",
    description: "Juni → juli · HYROX-klas vaste prik + eerste blokken en mini-sim.",
  },
  {
    id: "FASE3",
    name: "FASE 3",
    label: "Echte HYROX-training",
    weeks: [15, 16, 17, 18, 19],
    color: "#fb7185",
    description: "Race-fit: opgebouwde simulatie (50–90%) met vaste klas en scherpe runs.",
  },
  {
    id: "FASE4",
    name: "FASE 4",
    label: "Taper & race",
    weeks: [20, 21, 22],
    color: "#22d3ee",
    description: "Volume omlaag, fris blijven — afronden met HYROX race-weekend.",
  },
] as const;

export const PR_STATION_IDS = [
  "ski",
  "row",
  "wallballs",
  "sled_push",
  "run_1km",
  "run_5km",
] as const;

export type PRStationId = (typeof PR_STATION_IDS)[number];

export const PR_STATION_LABELS: Record<PRStationId, string> = {
  ski: "SkiErg 1000m (sec)",
  row: "Row 1000m (sec)",
  wallballs: "Wall Balls 100 (sec)",
  sled_push: "Sled Push 50m (sec)",
  run_1km: "Run 1 km (sec)",
  run_5km: "Run 5 km (sec)",
};
