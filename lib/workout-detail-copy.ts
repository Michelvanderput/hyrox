import type { WorkoutType } from "@/types";

export type WorkoutExtraBlock = {
  focus: string;
  tips: string[];
  /** Korte HYROX-context */
  hyroxNote?: string;
};

const BY_TYPE: Record<WorkoutType, WorkoutExtraBlock> = {
  run: {
    focus: "Aerobe basis & pacing",
    tips: [
      "Houd hartslag in zone 2 bij easy runs — je moet kunnen praten.",
      "Bij intervallen: start gecontroleerd; laatste reps zijn ‘hard maar technisch strak’.",
      "Plan routes met lichte ondergrond om pezen te sparen.",
    ],
    hyroxNote: "In de race wissel je hard lopen af met stations — train daarom ook frisse benen na korte runs.",
  },
  gym: {
    focus: "Kracht & core voor stations",
    tips: [
      "Volgorde: grote bewegingen eerst (squat/hip hinge), daarna rug/schouders.",
      "2–3 RIR op hypertrofie sets; geen failure op deadlifts.",
      "Core: anti-rotatie (pallof) helpt bij sleds en carries.",
    ],
    hyroxNote: "Wall balls, farmers walks en sled push vragen ‘stevige’ benen + rug; overlap met HYROX is groot.",
  },
  station: {
    focus: "Techniek & schakels",
    tips: [
      "SkiErg: lange zwaai, rustig tempo — adem ritmisch.",
      "Row: duw met benen, trek strak naar borst; geen ‘arms only’.",
      "Wall ball: squat diep genoeg, gooi recht omhoog, vang zacht.",
    ],
    hyroxNote: "Dit zijn race-specifieke patronen; noteer tijden per blok om progressie te zien.",
  },
  combo: {
    focus: "Run + station in één sessie",
    tips: [
      "Behandel de overgang run → station als skill: 30 s rust, dan meteen vorm.",
      "Houd volume realistisch — kwaliteit > hoeveelheid blokken.",
    ],
    hyroxNote: "Doubles: spreek rollen af (wie start op welk station) en oefen wissels.",
  },
  class: {
    focus: "Groepsles / variatie",
    tips: [
      "Kies een intensiteit waar je nog 1–2 dagen later kunt trainen.",
      "Gebruik de les voor mobiliteit en energie, niet als max-test.",
    ],
  },
  rest: {
    focus: "Herstel",
    tips: [
      "Licht bewegen (wandelen) stimuleert doorbloeding.",
      "Slaap en eiwitten zijn vandaag je ‘training’.",
      "Foam rollen: 5–8 minuten op kuiten/quadriceps.",
    ],
  },
  race: {
    focus: "Simulatie / test",
    tips: [
      "Eet en drink zoals op wedstrijddag (mini dry-run).",
      "Noteer splits per station — data = leerpunten.",
      "Plan 48–72 uur rust voor een echte race.",
    ],
    hyroxNote: "Maastricht MECC: check bagage, heat-tijden en looplijnen in je hoofd.",
  },
};

export function getWorkoutExtraCopy(type: WorkoutType): WorkoutExtraBlock {
  return BY_TYPE[type];
}
