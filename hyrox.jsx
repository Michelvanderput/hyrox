import { useState, useEffect } from "react";

const RACE_DATE = new Date("2026-09-20T08:00:00");
const START_DATE = new Date("2026-04-13");
const TOTAL_WEEKS = 23;

const STATIONS = [
  { id: "ski", name: "SkiErg", icon: "🎿", spec: "1000m", tip: "Lange, krachtige halen. Gebruik je core, niet alleen je armen." },
  { id: "sled_push", name: "Sled Push", icon: "🛷", spec: "50m · 152kg (M) / 102kg (V)", tip: "Laag blijven, kleine stappen, door je hielen duwen." },
  { id: "sled_pull", name: "Sled Pull", icon: "🪢", spec: "50m · 103kg (M) / 78kg (V)", tip: "Hand-over-hand techniek. Ritmisch en consistent." },
  { id: "burpee_bj", name: "Burpee Broad Jump", icon: "🐸", spec: "80m", tip: "Bewaar energie: stap op ipv springen bij de burpee." },
  { id: "row", name: "RowErg", icon: "🚣", spec: "1000m", tip: "Damper op 5-7. Benen eerst, dan rug, dan armen." },
  { id: "farmers", name: "Farmers Carry", icon: "🏋️", spec: "200m · 2×24kg (M) / 2×16kg (V)", tip: "Schouders laag, core aan, stevig doorlopen." },
  { id: "lunges", name: "Sandbag Lunges", icon: "🎒", spec: "100m · 20kg (M) / 10kg (V)", tip: "Knie moet de grond raken. Houd constant ritme." },
  { id: "wallballs", name: "Wall Balls", icon: "🏐", spec: "100 reps · 6kg (M) / 4kg (V)", tip: "Vang in squat-positie. Gebruik je benen, niet armen." },
];

const PHASES = [
  { name: "BASE", label: "Base Building", weeks: [1,2,3,4,5,6], color: "#38bdf8", desc: "Aerobe basis, techniek, gewenning" },
  { name: "STRENGTH", label: "Kracht & Volume", weeks: [7,8,9,10,11,12], color: "#a78bfa", desc: "Zwaardere gewichten, hogere volumes" },
  { name: "RACESIM", label: "Race Simulatie", weeks: [13,14,15,16,17,18], color: "#f472b6", desc: "Race-specifiek, duo-simulaties, transities" },
  { name: "TAPER", label: "Peak & Taper", weeks: [19,20,21,22,23], color: "#fbbf24", desc: "Volume omlaag, vers naar de start" },
];

function getPhase(w) { return PHASES.find(p => p.weeks.includes(w)) || PHASES[3]; }

function generateWeek(w) {
  const p = getPhase(w);
  if (p.name === "BASE") {
    return [
      { day: "Ma", title: "Easy Run", type: "run", desc: `${3+Math.min(w,5)}km zone 2 – praattempo`, dur: "30-45 min" },
      { day: "Di", title: "Full Body Gym", type: "gym", desc: "Squats 4×10, Deadlifts 3×8, DB Rows 3×12, OH Press 3×10, Planks 3×45s", dur: "50 min" },
      { day: "Wo", title: "Intervallen", type: "run", desc: `${3+Math.min(w,4)}× 400m @ 80% met 90s wandelrust`, dur: "35 min" },
      { day: "Do", title: "Station Techniek", type: "station", desc: "SkiErg 3×500m, Row 3×500m, Wall Balls 3×15, Lunges 3×16", dur: "45 min" },
      { day: "Vr", title: "Groepsles / HIIT", type: "class", desc: "CrossFit, HIIT-les of 30 min steady-state cardio", dur: "45 min" },
      { day: "Za", title: "Long Run + Partner", type: "combo", desc: `${5+w}km easy samen, daarna 20 min stationtechniek duo`, dur: "60-75 min" },
      { day: "Zo", title: "Rust & Herstel", type: "rest", desc: "Wandelen, stretchen, foam rollen", dur: "—" },
    ];
  }
  if (p.name === "STRENGTH") {
    const a = w - 6;
    return [
      { day: "Ma", title: "Tempo Run", type: "run", desc: `1km warm-up, ${3+Math.min(a,4)}km tempo (zone 3-4), 1km cool-down`, dur: "40-50 min" },
      { day: "Di", title: "Heavy Strength", type: "gym", desc: "Back Squat 5×5 zwaar, Hip Thrusts 4×8, Sled Push sim 4×25m, Rows 4×8", dur: "55 min" },
      { day: "Wo", title: "Run + Stations", type: "combo", desc: "4 rondes: 1km run + SkiErg 500m of Row 500m (afwisselen)", dur: "50 min" },
      { day: "Do", title: "Upper Body + Core", type: "gym", desc: "Pull-ups 4×max, Farmers Walk 4×50m, KB Swings 4×15, TGU 3×5/kant", dur: "50 min" },
      { day: "Vr", title: "Groepsles", type: "class", desc: "Bootcamp, spinning of functionele les", dur: "45 min" },
      { day: "Za", title: "Duo Race Prep", type: "combo", desc: `Long run ${7+a}km samen, 3 stations op race-gewicht afwisselen`, dur: "75-90 min" },
      { day: "Zo", title: "Rust & Herstel", type: "rest", desc: "Lichte wandeling, mobility, mentale prep", dur: "—" },
    ];
  }
  if (p.name === "RACESIM") {
    return [
      { day: "Ma", title: "Race Pace Intervals", type: "run", desc: "6× 1km @ race pace met 2 min rust", dur: "45 min" },
      { day: "Di", title: "Station Circuit", type: "station", desc: "Alle 8 stations op race-gewicht, 1 set, minimale rust", dur: "50 min" },
      { day: "Wo", title: "Compromised Running", type: "combo", desc: "4 rondes: Wall Balls 25 → direct 1km run", dur: "50 min" },
      { day: "Do", title: "Kracht Onderhoud", type: "gym", desc: "Squats 3×6, Deadlifts 3×5, Sled Push/Pull 3×50m, Pull-ups 3×max", dur: "45 min" },
      { day: "Vr", title: "Easy Run / Les", type: "class", desc: "Lichte 5km of groepsles – focus herstel", dur: "35 min" },
      { day: "Za", title: "HALVE HYROX SIM", type: "combo", desc: "Met partner: 4km run + 4 stations (splits oefenen)", dur: "60-75 min" },
      { day: "Zo", title: "Rust & Herstel", type: "rest", desc: "Volledige rust of lichte yoga", dur: "—" },
    ];
  }
  // TAPER
  if (w >= 22) {
    return [
      { day: "Ma", title: "Shakeout Run", type: "run", desc: "20 min heel easy + paar strides", dur: "20 min" },
      { day: "Di", title: "Light Stations", type: "station", desc: "Elke station 1 korte set op 50%", dur: "30 min" },
      { day: "Wo", title: "Rust", type: "rest", desc: "Complete rust. Voeding checken.", dur: "—" },
      { day: "Do", title: "Shakeout", type: "run", desc: "15 min joggen + 4× 100m strides", dur: "20 min" },
      { day: "Vr", title: "Rust", type: "rest", desc: "Spullen klaarleggen voor de race.", dur: "—" },
      { day: "Za", title: w === 23 ? "Reis → Maastricht" : "Rust", type: "rest", desc: w === 23 ? "Reis naar Maastricht. Licht wandelen. Vroeg slapen." : "Compleet rust.", dur: "—" },
      { day: "Zo", title: w === 23 ? "🏁 RACE DAY!" : "Rust", type: w === 23 ? "race" : "rest", desc: w === 23 ? "HYROX Maastricht – MECC. Laat zien wat jullie kunnen! 🔥" : "Rust en herstel.", dur: w === 23 ? "~90 min" : "—" },
    ];
  }
  return [
    { day: "Ma", title: "Tempo Intervals", type: "run", desc: `${6-(w-18)}× 1km @ race pace, 90s rust`, dur: "40 min" },
    { day: "Di", title: "Light Strength", type: "gym", desc: "Squats 3×5 @70%, Pull-ups, KB Carries", dur: "40 min" },
    { day: "Wo", title: "Easy Run", type: "run", desc: `${5-Math.min(w-18,2)}km rustig`, dur: "30 min" },
    { day: "Do", title: "Race Rehearsal", type: "combo", desc: "2-3 stations race-gewicht + 2km run", dur: "35 min" },
    { day: "Vr", title: "Rust of Yoga", type: "rest", desc: "Optioneel: mobility of volledige rust", dur: "30 min" },
    { day: "Za", title: "Partner Check-in", type: "combo", desc: "4-5km run samen + strategie bespreken", dur: "45 min" },
    { day: "Zo", title: "Rust & Herstel", type: "rest", desc: "Volledige rust – jullie zijn bijna klaar!", dur: "—" },
  ];
}

const QUOTES = [
  "Samen starten, samen finishen. 🤝",
  "De sled pusht zichzelf niet. Aan de slag! 🛷",
  "Elke rep brengt jullie dichter bij de finish.",
  "Doubles = dubbele kracht, dubbele motivatie. 💪",
  "Pijn is tijdelijk, trots is voor altijd. 🏆",
  "Het verschil zit in de transities!",
  "Wall Balls: laatste station, dan zijn jullie finishers!",
  "Vertrouw op het plan. Week voor week sterker.",
  "September komt snel. Elke training telt. ⏰",
  "8km rennen + 8 stations. Stap voor stap.",
  "De SkiErg opent je race – begin met power!",
  "Ren moe, ren door. Compromised running is dé skill.",
  "Vandaag investeren = 20 september cashen. 🔥",
  "MECC Maastricht wacht op jullie!",
  "Grip strength wint races. Train die farmers carry!",
  "80m burpee broad jumps. Ritme boven snelheid.",
];

const TYPE_STYLES = {
  run:     { bg: "rgba(56,189,248,0.08)", border: "#38bdf8", tag: "🏃 Run" },
  gym:     { bg: "rgba(167,139,250,0.08)", border: "#a78bfa", tag: "🏋️ Gym" },
  station: { bg: "rgba(244,114,182,0.08)", border: "#f472b6", tag: "🎯 Station" },
  combo:   { bg: "rgba(251,191,36,0.08)", border: "#fbbf24", tag: "⚡ Combo" },
  class:   { bg: "rgba(45,212,191,0.08)", border: "#2dd4bf", tag: "👥 Klas" },
  rest:    { bg: "rgba(255,255,255,0.03)", border: "#444", tag: "😴 Rust" },
  race:    { bg: "rgba(239,68,68,0.12)", border: "#ef4444", tag: "🏁 RACE" },
};

const SKEY = "hyrox-duo-v3";

function getCurWeek() {
  const diff = Date.now() - START_DATE.getTime();
  return Math.max(1, Math.min(TOTAL_WEEKS, Math.ceil(diff / 604800000)));
}

export default function App() {
  const [names, setNames] = useState(["Atleet 1", "Atleet 2"]);
  const [editing, setEditing] = useState(null);
  const [checks, setChecks] = useState({});
  const [week, setWeek] = useState(getCurWeek());
  const [tab, setTab] = useState("plan");
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [qi, setQi] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(SKEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.names) setNames(d.names);
          if (d.checks) setChecks(d.checks);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try { await window.storage.set(SKEY, JSON.stringify({ names, checks })); } catch {}
    })();
  }, [names, checks, ready]);

  useEffect(() => {
    const tick = () => {
      const d = RACE_DATE - Date.now();
      if (d <= 0) { setCd({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCd({ d: Math.floor(d/864e5), h: Math.floor(d%864e5/36e5), m: Math.floor(d%36e5/6e4), s: Math.floor(d%6e4/1e3) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setQi(i => (i+1) % QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const toggle = (ai, w, di) => {
    const k = `${ai}-${w}-${di}`;
    setChecks(p => ({ ...p, [k]: !p[k] }));
  };

  const isOn = (ai, w, di) => !!checks[`${ai}-${w}-${di}`];

  const weekProg = (ai, w) => {
    const days = generateWeek(w);
    let c = 0;
    days.forEach((_, di) => { if (isOn(ai, w, di)) c++; });
    return { done: c, total: days.length };
  };

  const totalProg = (ai) => {
    let done = 0, total = 0;
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const days = generateWeek(w);
      days.forEach((_, di) => { total++; if (isOn(ai, w, di)) done++; });
    }
    return { done, total };
  };

  const days = generateWeek(week);
  const phase = getPhase(week);
  const cw = getCurWeek();

  return (
    <div style={{ minHeight: "100vh", background: "#08080d", color: "#e4e4ec", fontFamily: "'DM Sans','Sora',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700&family=Outfit:wght@300;400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sq{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 16px rgba(251,191,36,0.1)}50%{box-shadow:0 0 32px rgba(251,191,36,0.22)}}
        .fu{animation:fu .45s ease both}
        .tb{padding:9px 18px;border:1px solid #1a1a22;border-radius:10px;background:transparent;color:#777;cursor:pointer;font-size:13px;font-family:inherit;font-weight:600;transition:all .2s}
        .tb:hover{border-color:#333;color:#bbb}.tb.on{background:rgba(251,191,36,0.08);border-color:#fbbf24;color:#fbbf24}
        .wp{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:9px;border:1px solid #16161e;background:#0e0e16;color:#555;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;font-family:inherit;padding:0 3px}
        .wp:hover{border-color:#333;color:#999}.wp.cur{border-color:#fbbf24;color:#fbbf24;background:rgba(251,191,36,0.06)}
        .wp.sel{border-color:#eee;color:#eee;background:rgba(255,255,255,0.06)}
        .wp.prog::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#34d399}
        .wp.full::after{background:#fbbf24;width:5px;height:5px}
        .wp{position:relative}
        .ck{width:24px;height:24px;border-radius:7px;border:2px solid #2a2a34;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
        .ck:hover{border-color:#555}.ck.on{background:#fbbf24;border-color:#fbbf24}
        .ni{background:transparent;border:none;border-bottom:1px dashed #444;color:inherit;font-size:inherit;font-family:inherit;font-weight:inherit;outline:none;padding:2px 0;width:110px}
        .ni:focus{border-color:#fbbf24}
        .sc{padding:14px;border-radius:13px;border:1px solid #16161e;background:#0e0e16;transition:all .2s}
        .sc:hover{border-color:#2a2a34;transform:translateY(-1px)}
        .pr{transition:stroke-dashoffset .5s ease}
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,191,36,0.035) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.025) 0%,transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "20px 14px 50px" }}>

        {/* HEADER */}
        <header className="fu" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>🏁</span>
            <h1 style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#fbbf24,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HYROX MAASTRICHT</h1>
          </div>
          <p style={{ color: "#555", fontSize: 12, fontWeight: 300, letterSpacing: "0.06em" }}>DOUBLES TRAINING · MECC · 17–20 SEPT 2026</p>
        </header>

        {/* COUNTDOWN + QUOTE */}
        <div className="fu" style={{ animationDelay: ".08s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div style={{ padding: "16px 20px", borderRadius: 14, border: "1px solid #16161e", background: "linear-gradient(135deg,#0e0e16,#0a0a12)", animation: "glow 4s ease infinite" }}>
            <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, fontWeight: 600 }}>Race Day Countdown</div>
            <div style={{ display: "flex", gap: 14 }}>
              {[{ v: cd.d, l: "dagen" },{ v: cd.h, l: "uur" },{ v: cd.m, l: "min" },{ v: cd.s, l: "sec" }].map((u,i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, color: "#fbbf24", lineHeight: 1 }}>{String(u.v||0).padStart(2,'0')}</div>
                  <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>{u.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 14, border: "1px solid #16161e", background: "#0e0e16", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, fontWeight: 600 }}>Motivatie</div>
            <p key={qi} style={{ fontSize: 14, color: "#ccc", fontStyle: "italic", lineHeight: 1.5, animation: "sq .4s ease" }}>"{QUOTES[qi]}"</p>
          </div>
        </div>

        {/* ATHLETE CARDS */}
        <div className="fu" style={{ animationDelay: ".12s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          {names.map((nm, ai) => {
            const t = totalProg(ai);
            const wp = weekProg(ai, week);
            const pct = t.total > 0 ? Math.round(t.done/t.total*100) : 0;
            const wpct = wp.total > 0 ? Math.round(wp.done/wp.total*100) : 0;
            const r = 34, c = 2*Math.PI*r;
            const col = ai === 0 ? "#38bdf8" : "#f472b6";
            return (
              <div key={ai} style={{ padding: "16px", borderRadius: 14, border: `1px solid ${col}18`, background: `${col}04` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    {editing === ai ? (
                      <input className="ni" style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit" }} autoFocus value={nm}
                        onChange={e => setNames(p => { const n=[...p]; n[ai]=e.target.value; return n; })}
                        onBlur={() => setEditing(null)} onKeyDown={e => e.key==="Enter" && setEditing(null)} />
                    ) : (
                      <div onClick={() => setEditing(ai)} style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit", cursor: "pointer", color: col }} title="Klik om naam te wijzigen">{nm || `Atleet ${ai+1}`}</div>
                    )}
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{t.done}/{t.total} workouts</div>
                  </div>
                  <svg width="76" height="76" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r={r} fill="none" stroke="#16161e" strokeWidth="5" />
                    <circle cx="38" cy="38" r={r} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" className="pr"
                      strokeDasharray={c} strokeDashoffset={c - c*pct/100} transform="rotate(-90 38 38)" />
                    <text x="38" y="35" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit">{pct}%</text>
                    <text x="38" y="48" textAnchor="middle" fill="#555" fontSize="8">totaal</text>
                  </svg>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#16161e", overflow: "hidden" }}>
                    <div style={{ width: `${wpct}%`, height: "100%", borderRadius: 3, background: col, transition: "width .4s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#666", whiteSpace: "nowrap" }}>Wk {week}: {wp.done}/{wp.total}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABS */}
        <div className="fu" style={{ animationDelay: ".16s", display: "flex", gap: 7, marginBottom: 18 }}>
          {[{ id: "plan", l: "📋 Weekplan" },{ id: "stations", l: "🎯 Stations" },{ id: "overview", l: "📊 Overzicht" }].map(t => (
            <button key={t.id} className={`tb ${tab===t.id?"on":""}`} onClick={() => setTab(t.id)}>{t.l}</button>
          ))}
        </div>

        {/* ═══ PLAN TAB ═══ */}
        {tab === "plan" && <>
          <div className="fu" style={{ animationDelay: ".2s", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>Fase:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: phase.color }}>{phase.label}</span>
              <span style={{ fontSize: 11, color: "#444" }}>— {phase.desc}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {Array.from({length:TOTAL_WEEKS},(_,i)=>i+1).map(w => {
                const any = [0,1].some(ai => weekProg(ai,w).done > 0);
                const all = [0,1].every(ai => { const p=weekProg(ai,w); return p.done===p.total; });
                const ph = getPhase(w);
                return (
                  <button key={w} className={`wp ${w===cw?"cur":""} ${w===week?"sel":""} ${all?"full":any?"prog":""}`}
                    onClick={() => setWeek(w)} style={{ borderLeftColor: ph.color, borderLeftWidth: 3 }} title={`Week ${w} · ${ph.label}`}>{w}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {days.map((d, di) => {
              const ts = TYPE_STYLES[d.type] || TYPE_STYLES.rest;
              return (
                <div key={di} className="fu" style={{ animationDelay: `${.24+di*.03}s`, display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 12, padding: "14px 16px", borderRadius: 12, border: `1px solid ${ts.border}1a`, background: ts.bg, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ts.border, fontFamily: "Outfit" }}>{d.day}</div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>{ts.tag}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e4e4ec", marginBottom: 2 }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{d.desc}</div>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>⏱ {d.dur}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    {names.map((nm, ai) => (
                      <div key={ai} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <button className={`ck ${isOn(ai,week,di)?"on":""}`} onClick={() => toggle(ai,week,di)}
                          title={`${nm}: ${isOn(ai,week,di)?"Done":"Nog niet"}`}>
                          {isOn(ai,week,di) && <span style={{ fontSize: 13, color: "#000", fontWeight: 700 }}>✓</span>}
                        </button>
                        <span style={{ fontSize: 8, color: ai===0?"#38bdf8":"#f472b6", maxWidth: 44, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(nm||`A${ai+1}`).substring(0,6)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ═══ STATIONS TAB ═══ */}
        {tab === "stations" && (
          <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STATIONS.map((s, i) => (
              <div key={s.id} className="sc fu" style={{ animationDelay: `${.08+i*.04}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 14, color: "#e4e4ec" }}>
                      <span style={{ color: "#555", fontSize: 11, marginRight: 4 }}>#{i+1}</span>{s.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#777", marginTop: 1 }}>{s.spec}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid #16161e" }}>💡 {s.tip}</div>
              </div>
            ))}
            <div style={{ gridColumn: "1/-1", padding: "14px 18px", borderRadius: 13, border: "1px solid #16161e", background: "#0e0e16", marginTop: 2 }}>
              <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>🤝 Doubles Strategie</div>
              <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7 }}>
                Bij Doubles rennen jullie élke 1km <strong style={{ color: "#fbbf24" }}>samen</strong> – te ver uit elkaar = 3 min straftijd.
                Bij stations mogen jullie het werk <strong style={{ color: "#fbbf24" }}>vrij verdelen</strong>. Tip: de snelste loper eindigt elk station → de langzamere gaat frisser de run in.
                Oefen "touch tagging" en korte verbale cues.
              </div>
            </div>
          </div>
        )}

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && (
          <div className="fu">
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#bbb" }}>Trainingsperiodisering</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PHASES.map((ph, pi) => {
                  const tot = ph.weeks.length * 7 * 2;
                  let dn = 0;
                  ph.weeks.forEach(w => { [0,1].forEach(ai => { generateWeek(w).forEach((_,di) => { if (isOn(ai,w,di)) dn++; }); }); });
                  const pp = tot > 0 ? Math.round(dn/tot*100) : 0;
                  const cur = ph.weeks.includes(cw);
                  return (
                    <div key={pi} style={{ padding: "12px 16px", borderRadius: 11, border: `1px solid ${cur?ph.color+"33":"#16161e"}`, background: cur?ph.color+"06":"#0e0e16", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 5, height: 36, borderRadius: 3, background: ph.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Outfit", color: ph.color }}>
                          {ph.label} <span style={{ color: "#444", fontWeight: 400, fontSize: 11 }}>· Wk {ph.weeks[0]}–{ph.weeks[ph.weeks.length-1]}</span>
                          {cur && <span style={{ marginLeft: 6, fontSize: 9, padding: "2px 7px", borderRadius: 5, background: ph.color+"18", color: ph.color }}>NU</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>{ph.desc}</div>
                        <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: "#16161e", overflow: "hidden" }}>
                          <div style={{ width: `${pp}%`, height: "100%", borderRadius: 2, background: ph.color, transition: "width .4s" }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 800, color: pp>0?ph.color:"#2a2a34" }}>{pp}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: 13, border: "1px solid #16161e", background: "#0e0e16", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "Outfit", fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#bbb" }}>🏁 Race Format</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {STATIONS.map((s,i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid #16161e" }}>
                    <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 600, marginBottom: 2 }}>1km →</div>
                    <div style={{ fontSize: 16, marginBottom: 1 }}>{s.icon}</div>
                    <div style={{ fontSize: 9, color: "#999", fontWeight: 600 }}>{s.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#fbbf24", fontWeight: 700, fontFamily: "Outfit" }}>→ FINISH 🏆</div>
            </div>

            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <button style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #2a1111", background: "rgba(239,68,68,0.05)", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}
                onClick={() => { if (confirm("Alle voortgang resetten?")) setChecks({}); }}>🗑 Reset voortgang</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 10, color: "#222" }}>HYROX Maastricht · MECC · 17–20 Sept 2026 · Doubles Tracker</div>
      </div>
    </div>
  );
}