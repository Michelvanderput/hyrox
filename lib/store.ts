"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { PHASES, TOTAL_WEEKS } from "@/lib/constants";
import { completionKey, parseCompletionKey } from "@/lib/utils";
import { generateWeek } from "@/lib/training-plan";
import type { CompletionMeta, PersonalRecordEntry } from "@/types";
import type { Database } from "@/types/database";

type CloudCompletionRow = Database["public"]["Tables"]["completions"]["Row"];
type CloudMemberSnapshot = { userId: string; name: string; motivationNote: string | null };

const STORAGE_KEY = "hyrox-tracker-v1";

interface TrackerState {
  athleteNames: [string, string];
  completions: Record<string, boolean>;
  completionMeta: Record<string, CompletionMeta>;
  selectedWeek: number;
  prEntries: PersonalRecordEntry[];
  activeTeamId: string | null;
  memberUserIds: [string | null, string | null];
  /** Zelfde volgorde als atleten na sorteren op userId (zoals workspace-snapshot). */
  memberMotivations: [string | null, string | null];
  setAthleteName: (index: 0 | 1, name: string) => void;
  setSelectedWeek: (week: number) => void;
  toggleCompletion: (athleteIndex: 0 | 1, weekNumber: number, dayIndex: number) => void;
  setCompletionMeta: (
    athleteIndex: 0 | 1,
    weekNumber: number,
    dayIndex: number,
    meta: CompletionMeta,
  ) => void;
  resetProgress: () => void;
  addPr: (entry: Omit<PersonalRecordEntry, "id" | "recordedAt"> & { recordedAt?: string }) => void;
  removePr: (id: string) => void;
  importSnapshot: (data: unknown) => void;
  exportSnapshot: () => string;
  getWeekProgress: (athleteIndex: 0 | 1, weekNumber: number) => { done: number; total: number };
  getTotalProgress: (athleteIndex: 0 | 1) => { done: number; total: number };
  getPhaseProgress: () => Array<{
    phaseId: string;
    label: string;
    color: string;
    description: string;
    weeks: readonly number[];
    pctA0: number;
    pctA1: number;
  }>;
  getWeeklyAdherence: () => { week: number; a0: number; a1: number }[];
  applyWorkspaceSnapshot: (input: {
    teamId: string;
    members: CloudMemberSnapshot[];
    completions: CloudCompletionRow[];
  }) => void;
  clearCloudWorkspace: () => void;
  applyRemoteCompletionPayload: (input: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: CloudCompletionRow | null;
    old: CloudCompletionRow | null;
  }) => void;
}

function totalScheduledSlots(): number {
  let t = 0;
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    t += generateWeek(w).length;
  }
  return t;
}

const TOTAL_SLOTS = totalScheduledSlots();

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      athleteNames: ["Teamlid A", "Teamlid B"],
      completions: {},
      completionMeta: {},
      selectedWeek: 1,
      prEntries: [],
      activeTeamId: null,
      memberUserIds: [null, null],
      memberMotivations: [null, null],

      applyWorkspaceSnapshot: ({ teamId, members, completions }) => {
        const sorted = [...members].sort((a, b) => a.userId.localeCompare(b.userId));
        const id0 = sorted[0]?.userId ?? null;
        const id1 = sorted[1]?.userId ?? null;
        const athleteNames: [string, string] = [
          sorted[0]?.name?.trim() ? sorted[0].name.trim() : "Teamlid A",
          sorted[1]?.name?.trim() ? sorted[1].name.trim() : "Teamlid B",
        ];
        const memberMotivations: [string | null, string | null] = [
          sorted[0]?.motivationNote?.trim() ? sorted[0].motivationNote.trim() : null,
          sorted[1]?.motivationNote?.trim() ? sorted[1].motivationNote.trim() : null,
        ];

        set((s) => {
          const nextCompletions = { ...s.completions };
          const nextMeta = { ...s.completionMeta };

          for (const key of Object.keys(nextCompletions)) {
            const parsed = parseCompletionKey(key);
            if (!parsed) continue;
            if (parsed.athleteIndex === 0 || parsed.athleteIndex === 1) {
              delete nextCompletions[key];
            }
          }
          for (const key of Object.keys(nextMeta)) {
            const parsed = parseCompletionKey(key);
            if (!parsed) continue;
            if (parsed.athleteIndex === 0 || parsed.athleteIndex === 1) {
              delete nextMeta[key];
            }
          }

          for (const row of completions) {
            const idx =
              id0 && row.user_id === id0 ? 0 : id1 && row.user_id === id1 ? 1 : null;
            if (idx === null) continue;
            const key = completionKey(idx, row.week_number, row.day_index);
            nextCompletions[key] = !!row.completed;
            const meta: CompletionMeta = {};
            if (row.rating != null) meta.rating = row.rating;
            if (row.notes) meta.notes = row.notes;
            if (row.actual_duration_min != null) meta.actualDurationMin = row.actual_duration_min;
            if (Object.keys(meta).length) nextMeta[key] = meta;
          }

          return {
            activeTeamId: teamId,
            memberUserIds: [id0, id1],
            memberMotivations,
            athleteNames,
            completions: nextCompletions,
            completionMeta: nextMeta,
          };
        });
      },

      clearCloudWorkspace: () =>
        set({
          activeTeamId: null,
          memberUserIds: [null, null],
          memberMotivations: [null, null],
        }),

      applyRemoteCompletionPayload: ({ eventType, new: nextRow, old: prevRow }) => {
        const row = eventType === "DELETE" ? prevRow : nextRow;
        if (!row) return;

        const { activeTeamId, memberUserIds } = get();
        if (!activeTeamId || row.team_id !== activeTeamId) return;

        const idx =
          memberUserIds[0] === row.user_id ? 0 : memberUserIds[1] === row.user_id ? 1 : null;
        if (idx === null) return;

        const key = completionKey(idx, row.week_number, row.day_index);

        if (eventType === "DELETE") {
          set((s) => {
            const nextCompletions = { ...s.completions };
            const nextMeta = { ...s.completionMeta };
            delete nextCompletions[key];
            delete nextMeta[key];
            return { completions: nextCompletions, completionMeta: nextMeta };
          });
          return;
        }

        if (!nextRow) return;

        const completed = !!nextRow.completed;
        set((s) => {
          const nextCompletions = { ...s.completions, [key]: completed };
          const nextMeta = { ...s.completionMeta };

          if (!completed) {
            delete nextMeta[key];
          } else {
            const fresh: CompletionMeta = {};
            if (nextRow.rating != null) fresh.rating = nextRow.rating;
            if (nextRow.notes) fresh.notes = nextRow.notes;
            if (nextRow.actual_duration_min != null) {
              fresh.actualDurationMin = nextRow.actual_duration_min;
            }
            if (Object.keys(fresh).length) nextMeta[key] = fresh;
            else delete nextMeta[key];
          }

          return { completions: nextCompletions, completionMeta: nextMeta };
        });
      },

      setAthleteName: (index, name) =>
        set((s) => {
          const next: [string, string] = [...s.athleteNames];
          next[index] = name;
          return { athleteNames: next };
        }),

      setSelectedWeek: (week) =>
        set({ selectedWeek: Math.max(1, Math.min(TOTAL_WEEKS, week)) }),

      toggleCompletion: (athleteIndex, weekNumber, dayIndex) => {
        const key = completionKey(athleteIndex, weekNumber, dayIndex);
        set((s) => {
          const on = !s.completions[key];
          const nextMeta = { ...s.completionMeta };
          if (!on) delete nextMeta[key];
          return {
            completions: { ...s.completions, [key]: on },
            completionMeta: nextMeta,
          };
        });
      },

      setCompletionMeta: (athleteIndex, weekNumber, dayIndex, meta) => {
        const key = completionKey(athleteIndex, weekNumber, dayIndex);
        set((s) => ({
          completionMeta: { ...s.completionMeta, [key]: { ...s.completionMeta[key], ...meta } },
          completions: { ...s.completions, [key]: true },
        }));
      },

      resetProgress: () => set({ completions: {}, completionMeta: {} }),

      addPr: (entry) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
        const full: PersonalRecordEntry = {
          id,
          athleteIndex: entry.athleteIndex,
          stationId: entry.stationId,
          value: entry.value,
          notes: entry.notes,
          recordedAt: entry.recordedAt ?? new Date().toISOString(),
        };
        set((s) => ({ prEntries: [full, ...s.prEntries] }));
      },

      removePr: (id) =>
        set((s) => ({ prEntries: s.prEntries.filter((e) => e.id !== id) })),

      importSnapshot: (data) => {
        if (!data || typeof data !== "object") return;
        const d = data as Partial<{
          athleteNames: [string, string];
          completions: Record<string, boolean>;
          completionMeta: Record<string, CompletionMeta>;
          selectedWeek: number;
          prEntries: PersonalRecordEntry[];
          activeTeamId: string | null;
          memberUserIds: [string | null, string | null];
          memberMotivations: [string | null, string | null];
        }>;
        set({
          athleteNames: d.athleteNames ?? get().athleteNames,
          completions: d.completions ?? {},
          completionMeta: d.completionMeta ?? {},
          selectedWeek: d.selectedWeek ?? 1,
          prEntries: Array.isArray(d.prEntries) ? d.prEntries : [],
          activeTeamId: d.activeTeamId ?? get().activeTeamId,
          memberUserIds: d.memberUserIds ?? get().memberUserIds,
          memberMotivations:
            Array.isArray(d.memberMotivations) && d.memberMotivations.length === 2
              ? d.memberMotivations
              : [null, null],
        });
      },

      exportSnapshot: () =>
        JSON.stringify(
          {
            athleteNames: get().athleteNames,
            completions: get().completions,
            completionMeta: get().completionMeta,
            selectedWeek: get().selectedWeek,
            prEntries: get().prEntries,
            activeTeamId: get().activeTeamId,
            memberUserIds: get().memberUserIds,
            memberMotivations: get().memberMotivations,
          },
          null,
          2,
        ),

      getWeekProgress: (athleteIndex, weekNumber) => {
        const days = generateWeek(weekNumber);
        let done = 0;
        days.forEach((_, di) => {
          if (get().completions[completionKey(athleteIndex, weekNumber, di)]) done++;
        });
        return { done, total: days.length };
      },

      getTotalProgress: (athleteIndex) => {
        let done = 0;
        for (let w = 1; w <= TOTAL_WEEKS; w++) {
          const days = generateWeek(w);
          days.forEach((_, di) => {
            if (get().completions[completionKey(athleteIndex, w, di)]) done++;
          });
        }
        return { done, total: TOTAL_SLOTS };
      },

      getPhaseProgress: () => {
        return PHASES.map((ph) => {
          let slots = 0;
          let d0 = 0;
          let d1 = 0;
          ph.weeks.forEach((w) => {
            const days = generateWeek(w);
            days.forEach((_, di) => {
              slots++;
              if (get().completions[completionKey(0, w, di)]) d0++;
              if (get().completions[completionKey(1, w, di)]) d1++;
            });
          });
          return {
            phaseId: ph.id,
            label: ph.label,
            color: ph.color,
            description: ph.description,
            weeks: ph.weeks,
            pctA0: slots ? Math.round((d0 / slots) * 100) : 0,
            pctA1: slots ? Math.round((d1 / slots) * 100) : 0,
          };
        });
      },

      getWeeklyAdherence: () => {
        const out: { week: number; a0: number; a1: number }[] = [];
        for (let w = 1; w <= TOTAL_WEEKS; w++) {
          const days = generateWeek(w);
          const tot = days.length;
          let a0 = 0;
          let a1 = 0;
          days.forEach((_, di) => {
            if (get().completions[completionKey(0, w, di)]) a0++;
            if (get().completions[completionKey(1, w, di)]) a1++;
          });
          out.push({
            week: w,
            a0: tot ? Math.round((a0 / tot) * 100) : 0,
            a1: tot ? Math.round((a1 / tot) * 100) : 0,
          });
        }
        return out;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        athleteNames: s.athleteNames,
        completions: s.completions,
        completionMeta: s.completionMeta,
        selectedWeek: s.selectedWeek,
        prEntries: s.prEntries,
        activeTeamId: s.activeTeamId,
        memberUserIds: s.memberUserIds,
      }),
    },
  ),
);
