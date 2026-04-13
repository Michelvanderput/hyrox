import type { HyroxStationDef } from "@/lib/constants";

export type StationEncyclopediaEntry = {
  /** Extra context naast de officiële specs. */
  info: string;
  /** Typische fouten of aandachtspunten in de race. */
  pitfalls?: string;
  /** Oefeningen die dezelfde energie-systemen of spiergroepen raken. */
  exercises: { name: string; note: string }[];
};

export const STATION_ENCYCLOPEDIA: Record<HyroxStationDef["id"], StationEncyclopediaEntry> = {
  ski: {
    info: "De SkiErg vraagt veel van rug, triceps en core — vooral na zeven kilometer hardlopen. Denk aan lange, rustige halen met lichte gripdruk; versnellen doe je met cadence, niet door te ‘rukken’ met de armen alleen.",
    pitfalls: "Te hoge cadence meteen: je bovenrug en voorarmen zuipen leeg vóór de afstand klaar is.",
    exercises: [
      { name: "SkiErg intervals", note: "8–12 × 200–250 m, rustig tempo — focus op sequentie rug → armen." },
      { name: "Lat pulldown / pull-ups", note: "Volume voor rugkracht; match met race-greep waar mogelijk." },
      { name: "Dead hang + farmers light", note: "Grip en schouderstabiliteit zonder wall ball-vermoeidheid." },
      { name: "Renegade rows / plank rows", note: "Anti-rotatie core — helpt tegen ‘zweven’ op de erg." },
    ],
  },
  sled_push: {
    info: "Korte, explosieve benenbelasting met constante druk op het sled. HYROX-matten zijn vaak stroef; train ook mentaal om niet te ‘hoog’ te blijven staan wanneer de benen branden.",
    pitfalls: "Armen te veel duwen i.p.v. hielen-kuiten-kuiten; of te lange passen waardoor je grip verliest.",
    exercises: [
      { name: "Zware sled / prowler pushes", note: "5–15 m sets, laag lichaam — nabootst hoek en cadans." },
      { name: "Tempo squats + wall sits", note: "Beenkracht en isometrische pijn-tolerantie." },
      { name: "Split squats / step-ups", note: "Eénbeen stabiliteit voor strakke lijn achter de sled." },
      { name: "Korte heuvelsprints", note: "Hielslag en forward lean zonder sled-beschikbaarheid." },
    ],
  },
  sled_pull: {
    info: "Vooral grip, biceps en rug in herhalende hand-over-hand beweging. Ritme houden kost minder energie dan onregelmatig jerken — vooral relevant na brede jumps en voor wall balls.",
    pitfalls: "Te groot pak aan touw per pull → rug rond; of grip te smal waardoor onderarmen snel dichtklappen.",
    exercises: [
      { name: "Seated rope pulls", note: "Zelfde trek-lijn, controleer adem (uit bij pull)." },
      { name: "Farmer carries (zwaarder, korter)", note: "Grip endurance + rechte rug." },
      { name: "Barbell / ring rows hoge reps", note: "Rugvolume zonder technisch zware deadlifts op vermoeide dag." },
      { name: "Dead hangs + plate pinches", note: "Pure grip zonder veel schouderstress." },
    ],
  },
  burpee_bj: {
    info: "Aerobe power: burpees met voorwaartse explosie. HYROX telt afstand, niet stijl — zoek een cadans die je 80 m volhoudt zonder na 20 m in de rode zone te zitten.",
    pitfalls: "Te hoge burpee (verticaal springen) i.p.v. voorwaarts; of te weinig stap tussen landen en volgende rep.",
    exercises: [
      { name: "Broad jump series", note: "3–5 sprongen + jog terug — leer afzet en landing." },
      { name: "Burpee step-back EMOM", note: "Lage impact variant om volume veilig op te bouwen." },
      { name: "Shuttle runs 10–20 m", note: "Richtingwissels en acceleratie tussen zones." },
      { name: "Box jump step-down", note: "Landing en kniecontrole zonder brede jump-vermoeidheid." },
    ],
  },
  row: {
    info: "De RowErg beloont techniek: 60% benen, 20% rug, 20% armen. Op damper 5–7 kun je een sterk ritme vinden; hoger is zelden slimmer op 1000 m na veel gelopen kilometers.",
    pitfalls: "Te snelle start (fly-and-die); of alleen armen bij laatste 300 m waardoor de rug opblaast.",
    exercises: [
      { name: "500 m + 250 m repeats", note: "Pacing-practice — tweede stuk dicht bij race-split." },
      { name: "Tempo squats / leg press", note: "Meer ‘push’ uit de benen op de drive." },
      { name: "Romanian deadlift licht", note: "Hinge-positiesgevoel voor rughoek op de erg." },
      { name: "Assault / bike erg intervals", note: "Alternatief voor engine zonder rowing-grip overload." },
    ],
  },
  farmers: {
    info: "200 m met kettlebells: schouders laag, wandelritme, ademhaling in de neus/uit door mond. Kleine correcties op de mat kosten seconden — train rechtdoor zonder zigzag.",
    pitfalls: "Schouders opgetrokken → nek/armspanning; of te brede pas waardoor KB’s slingeren.",
    exercises: [
      { name: "Farmer carries (afwisselend zwaar/lang)", note: "Zelfde implementatie als race waar mogelijk." },
      { name: "Suitcase carries (één arm)", note: "Anti-buiging core — helpt asymmetrie op mat." },
      { name: "Shrugs + external rotation band", note: "Schouderbladpositie onder belasting." },
      { name: "Trap bar / hex carries", note: "Als KB’s te licht: meer totaal gewicht, kortere afstand." },
    ],
  },
  lunges: {
    info: "Sandbag op schouders: single-leg volume met core-stabiliteit. Constant klein tempo wint het vaak van grote stappen die je op het laatst niet meer kunt herhalen.",
    pitfalls: "Te korte stap → voorste knie valt naar binnen; of bag te hoog waardoor ademhaling klemzit.",
    exercises: [
      { name: "Walking lunges (DB/KB)", note: "Zelfde stap-lengte als race; start zonder bag." },
      { name: "Bulgarian split squats", note: "Knie- en heupstabiliteit per been." },
      { name: "Sandbag / back squat volume", note: "Gewend raken aan load op traps." },
      { name: "Core: pallof press", note: "Anti-zijbuiging tijdens stappen." },
    ],
  },
  wallballs: {
    info: "100 reps: squat-endurance + schouders die ‘metdraaien’. De bal vangen laag bespaart energie; diep squatten voorkomt dat je alleen met armen gooit.",
    pitfalls: "Te hoge vang → extra werk voor triceps; of te smalle stand waardoor quadriceps te vroeg locken.",
    exercises: [
      { name: "Wall ball sets (submax)", note: "10–25 reps × meerdere sets op race-hoogte/lager gewicht." },
      { name: "Thrusters met barbell licht", note: "Zelfde motor pattern zonder bal-vangfouten." },
      { name: "Front squat hoge reps", note: "Beenkracht onder front rack." },
      { name: "Push press / strict press volume", note: "Schouderafwerking zonder squat-vermoeidheid." },
    ],
  },
};
