import { RACE_CONFIG } from "@/lib/constants";

export function DoublesStrategy() {
  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-base font-bold text-ink">Doubles strategie</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Bij Doubles rennen jullie elke 1 km <strong className="text-gold">samen</strong>.{" "}
        {RACE_CONFIG.doublesNote} Bij stations verdeel je het werk{" "}
        <strong className="text-gold">vrij</strong>: kies vaste rollen per station en oefen
        korte tags + duidelijke cues.
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[12px] text-muted">
        <li>Plan wie “sluit” op wall balls en lunges (vaak hoogste rugbelasting).</li>
        <li>Houd transities strak: geen extra stappen rond de mat.</li>
        <li>Simuleer met halve races om tempo en communicatie te testen.</li>
      </ul>
    </section>
  );
}
