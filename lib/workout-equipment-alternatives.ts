/**
 * Vaste toevoegingen onderaan workout-detail (Nederlands).
 * Houdt intentie gelijk als specifieke HYROX-apparatuur ontbreekt.
 */
export type WorkoutAltKey =
  | "pick_stations_intro"
  | "ergs_pair"
  | "sled_only"
  | "ski_wall_pair"
  | "mini_hyrox_and_sim"
  | "hyrox_class"
  | "wall_ball_run"
  | "farmers_grip_block"
  | "light_activation_wall"
  | "gym_band_cable";

const BLOCKS: Record<WorkoutAltKey, string> = {
  pick_stations_intro: `---\n**Geen SkiErg, Row of muur voor wall balls?** Houd duur en RPE gelijk, kies bv.:\n• **SkiErg** → Air bike / Echo (zelfde tijd, rustig tot steady), of 3–5 min brisk incline op loopband / buiten jog + 20 arm circles.\n• **RowErg** → SkiErg (zelfde tijd), Air bike met armen, of kabel-/band-rows (2 × 15–20 strakke reps) + 30 s “high knees” licht.\n• **Wall ball** → DB goblet thrusters, slam ball naar de grond, of air squat + lichte push press (2 × 10).`,

  ergs_pair: `---\n**Geen SkiErg en/of geen RowErg?** Houd het schema (tijd per stuk); per slot bv.:\n• **SkiErg** → Air bike, crosstrainer met armen, of 400–600 m rustig lopen + 15 swings met lichte DB.\n• **RowErg** → SkiErg, Air bike, roeimachine die je wél hebt, of kabel-row 3 × 12 met pauze-tempo.\nFocus blijft: rustige grip, regelmatige slag, uitademen onder lichte druk.`,

  sled_only: `---\n**Geen sled / geen touw?**\n• **Sled push** → zware DB walking lunges 20–40 m, traploper laag incline “duwpositie” (handen op rails, korte passen), of partner-resisted march (kort).\n• **Sled pull** → lage kabel seated pull, rope pulls in squat, of bent-over barbell row met explosieve intentie (licht gewicht, techniek).\nAls de faciliteit dicht is: gebruik de bestaande fallback (hip thrust + plank) en voeg 2 × 10 bodyweight good mornings toe voor “hinge-gevoel”.`,

  ski_wall_pair: `---\n**Geen SkiErg?** Air bike (zelfde tijd), elliptical met armen, of 400 m easy jog + 20 jumping jacks + 10 lichte DB swings.\n**Geen muur / medicinebal?** DB thrusters (lichtere gewichten, iets meer reps), slam ball naar de grond, of squat + strict press 2 × 8–12.`,

  mini_hyrox_and_sim: `---\n**Parcours zonder volledige HYROX-opstelling:** kies 4–5 blokken; per ontbrekend station de intentie nabootsen:\n• **Run** → buiten of loopband; afstand iets korten als je geen 1 km-stukken hebt (bijv. 2 × 600 m i.p.v. 1 km).\n• **Ski / row** → zie blok “ergs” hierboven (bike, kabel-row, korte run).\n• **Wall ball** → thrusters / slam ball.\n• **Sled** → lunges, trap push, zware farmers kort.\nLiever 10% minder volume dan slordige techniek — houd communicatie met je partner hetzelfde als op race.`,

  hyrox_class: `---\n**Les zonder alle race-machines?** Bespreek met de coach: elk station heeft meestal een gym-alternatief met dezelfde zone (benen / rug / adem / grip). Thuis of in open gym: vervang een blok door 8–12 min werk met vergelijkbare RPE (bike, kabel, DB-complex). Blijf binnen de lesduur — geen extra “eigen” metcon erachteraan.`,

  wall_ball_run: `---\n**Geen medicinebal of geen muur?** Vervang wall balls door goblet thrusters, slam ball, of air squat + push press (licht). Houd de **directe start na de run** — dat is het trainingsdoel.`,

  farmers_grip_block: `---\n**Geen kettlebells voor farmers?** Plate pinch walk, suitcase carry met één zware DB, hex-bar hold 20–30 s, of zware trap bar carry kort.\n**Rowing brace** → kabel- of band-row met borst op bankje, of chest-supported DB row (langzaam).`,

  light_activation_wall: `---\n**Geen wall ball?** Lichte DB thrusters (2 × 6) of alleen dynamische squats + lichte press boven het hoofd.`,

  gym_band_cable: `---\n**Geen kabel bij Pallof?** Gebruik een lange weerstandsband op ooghoogte, of partnerband; zelfde beweging, minder weerstand is oké.`,
};

export function appendWorkoutEquipmentNote(detail: string, key: WorkoutAltKey): string {
  const block = BLOCKS[key];
  if (!block) return detail;
  return `${detail.trimEnd()}\n\n${block}`;
}
