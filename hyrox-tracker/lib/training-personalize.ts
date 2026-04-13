import { generateWeek } from "@/lib/training-plan";
import type { DayWorkout } from "@/types";

/** 1 = basis, 2 = standaard, 3 = zwaarder/volume */
export type IntensityLevel = 1 | 2 | 3;

function levelBlock(run: IntensityLevel, str: IntensityLevel, type: DayWorkout["type"]): string {
  const runTxt: Record<IntensityLevel, string> = {
    1: "Renniveau 1 (basis): houd het rustiger — neem 30–90 s extra rust tussen intervallen, of één rep minder. Duurruns iets korter mag als je praattempo niet haalt.",
    2: "Renniveau 2 (standaard): volg het schema; splits gelijk houden.",
    3: "Renniveau 3 (sterk): als je techniek strak blijft, mag één extra interval of 3–5 s strakker per km; of 5 min extra duur op rustige dagen.",
  };
  const strTxt: Record<IntensityLevel, string> = {
    1: "Krachtniveau 1 (basis): −1 ronde bij circuits, of −20% reps; kies lichtste variant (knie-push-up, air squat zonder jump).",
    2: "Krachtniveau 2 (standaard): uitgebreide omschrijving volgen.",
    3: "Krachtniveau 3 (sterk): +1 ronde bij circuits óf +2–4 reps per set; stationgewicht één stap omhoog als veilig.",
  };

  const parts: string[] = ["\n\n─── Jouw niveaus (parallel met je partner) ───"];

  if (type === "run" || type === "combo" || type === "race") {
    parts.push(runTxt[run]);
  }
  if (type === "gym" || type === "station" || type === "combo" || type === "class") {
    parts.push(strTxt[str]);
  }
  if (type === "rest") {
    parts.push(
      "Rust blijft rust — wel mag je bij niveau 1 iets extra mobiliteit doen; bij niveau 3 mag een korte wandeling iets langer (max. 45 min zone 1).",
    );
  }

  return parts.join("\n");
}

export function personalizeDayWorkout(
  workout: DayWorkout,
  runLevel: IntensityLevel,
  strengthLevel: IntensityLevel,
): DayWorkout {
  const extra = levelBlock(runLevel, strengthLevel, workout.type);
  return {
    ...workout,
    detail: workout.detail ? `${workout.detail}${extra}` : `${workout.description}${extra}`,
  };
}

export function personalizeWeek(
  weekNumber: number,
  runLevel: IntensityLevel,
  strengthLevel: IntensityLevel,
): DayWorkout[] {
  return generateWeek(weekNumber).map((d) => personalizeDayWorkout(d, runLevel, strengthLevel));
}
