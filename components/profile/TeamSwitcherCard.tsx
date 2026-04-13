"use client";

import { useTrainingCloud } from "@/context/TrainingCloudContext";

export function TeamSwitcherCard() {
  const { teams, activeTeamId, selectTeam } = useTrainingCloud();

  if (teams.length <= 1) return null;

  return (
    <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
      <h2 className="font-heading text-sm font-bold">Actief team</h2>
      <p className="mt-1 text-[11px] text-muted">
        Je zit in meerdere teams — kies welke voortgang je in het dashboard ziet.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {teams.map((t) => {
          const active = t.id === activeTeamId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTeam(t.id)}
              className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition ${
                active ? "border-gold bg-gold/10 text-gold" : "border-edge bg-canvas text-ink"
              }`}
            >
              <span className="truncate">{t.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-muted">{t.inviteCode}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
