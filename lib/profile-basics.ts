/** Gedeeld door onboarding en profiel-bewerken. */

export const PROFILE_GENDERS = [
  { id: "male" as const, label: "Man (open-gewichten)" },
  { id: "female" as const, label: "Vrouw (open-gewichten)" },
  { id: "other" as const, label: "Anders / liever niet zeggen" },
];

export const PROFILE_LEVELS = [
  { id: "beginner" as const, label: "Beginner", hint: "Nieuw met HYROX of conditioneel starten." },
  {
    id: "intermediate" as const,
    label: "Gemiddeld",
    hint: "Regelmatig trainen, klaar om volume op te bouwen.",
  },
  {
    id: "advanced" as const,
    label: "Gevorderd",
    hint: "Sterke basis, race-pace en zware blocks zijn bekend.",
  },
];

export function fitnessLevelToRunStrength(
  l: "beginner" | "intermediate" | "advanced",
): { run: 1 | 2 | 3; strength: 1 | 2 | 3 } {
  if (l === "beginner") return { run: 1, strength: 1 };
  if (l === "advanced") return { run: 3, strength: 3 };
  return { run: 2, strength: 2 };
}
