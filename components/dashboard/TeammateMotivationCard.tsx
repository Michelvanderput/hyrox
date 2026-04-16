"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { updateMyTeamMotivationAction } from "@/app/actions/workspace";
import { sendPushToTeammateAction } from "@/app/actions/push";
import { useTrainingCloud } from "@/context/TrainingCloudContext";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useTrackerStore } from "@/lib/store";
import { appToast } from "@/lib/toast-store";

const MAX_LEN = 500;

export function TeammateMotivationCard() {
  const { userId } = useTrainingCloud();
  const activeTeamId = useTrackerStore((s) => s.activeTeamId);
  const memberUserIds = useTrackerStore((s) => s.memberUserIds);
  const athleteNames = useTrackerStore((s) => s.athleteNames);
  const memberMotivations = useTrackerStore((s) => s.memberMotivations);

  const myAthleteIdx = useMemo(() => {
    if (!userId) return null;
    if (memberUserIds[0] === userId) return 0 as const;
    if (memberUserIds[1] === userId) return 1 as const;
    return null;
  }, [memberUserIds, userId]);

  const partnerAthleteIdx = useMemo(() => {
    if (myAthleteIdx === null) return null;
    return myAthleteIdx === 0 ? (1 as const) : (0 as const);
  }, [myAthleteIdx]);

  const partnerName = partnerAthleteIdx !== null ? athleteNames[partnerAthleteIdx] : "Partner";
  const partnerNote = partnerAthleteIdx !== null ? memberMotivations[partnerAthleteIdx] : null;
  const mySavedNote = myAthleteIdx !== null ? memberMotivations[myAthleteIdx] ?? "" : "";

  const [draft, setDraft] = useState(mySavedNote);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(mySavedNote);
  }, [mySavedNote]);

  const hasTwoMembers = !!(memberUserIds[0] && memberUserIds[1]);

  const onSave = useCallback(() => {
    if (!activeTeamId || !isSupabaseConfigured()) {
      appToast.error("Geen actief team of cloud niet geconfigureerd.");
      return;
    }
    startTransition(async () => {
      const res = await updateMyTeamMotivationAction(activeTeamId, draft);
      if (!res.ok) {
        appToast.error(res.error);
        return;
      }
      appToast.success("Opgeslagen — je partner ziet dit op de homepagina.");
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));

      if (draft.trim()) {
        const myName = myAthleteIdx !== null ? athleteNames[myAthleteIdx] : "Je teamgenoot";
        void sendPushToTeammateAction(
          activeTeamId,
          {
            title: `💬 Bericht van ${myName}`,
            body: draft.trim().slice(0, 100),
            tag: "teammate-message",
            url: "/",
          },
          "teammate_message_enabled",
        );
      }
    });
  }, [activeTeamId, draft, myAthleteIdx, athleteNames]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="hyrox-card flex h-full flex-col justify-center p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Voor je partner
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Na Supabase-setup kun je hier een kort bericht zetten dat je teamgenoot ziet.
        </p>
      </div>
    );
  }

  return (
    <div className="hyrox-card flex h-full flex-col gap-4 p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Voor je partner
        </p>
        {!activeTeamId ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Maak een team aan of join met een code — daarna kun je elkaar hier motiveren.
          </p>
        ) : !hasTwoMembers ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nodig je partner uit met jullie teamcode. Zodra die erbij zit, zien jullie elkaars bericht
            hier.
          </p>
        ) : partnerNote ? (
          <blockquote className="mt-2 border-l-2 border-gold/60 pl-3 text-sm italic leading-relaxed text-ink/95">
            <span className="not-italic font-semibold text-muted">Van {partnerName}: </span>
            {partnerNote}
          </blockquote>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {partnerName} heeft nog geen bericht geplaatst — stuur zelf iets leuks om de bal rollen te
            krijgen.
          </p>
        )}
      </div>

      {activeTeamId && userId && myAthleteIdx !== null ? (
        <div className="space-y-2 border-t border-white/[0.06] pt-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Jouw bericht voor {partnerAthleteIdx !== null ? athleteNames[partnerAthleteIdx] : "partner"}
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
              rows={3}
              maxLength={MAX_LEN}
              placeholder="Bijv. vandaag skip ik wall balls — jij knalt ’m eruit. 💪"
              className="mt-1.5 w-full resize-y rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-faint">
              {draft.length}/{MAX_LEN}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={onSave}
              className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-canvas disabled:opacity-50"
            >
              {pending ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </div>
      ) : activeTeamId && !userId ? (
        <p className="border-t border-white/[0.06] pt-3 text-[11px] text-muted">
          Log in om een bericht voor je partner te schrijven.
        </p>
      ) : null}
    </div>
  );
}
