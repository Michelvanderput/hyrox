"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { getMyProfileAction, updateMyProfileBasicsAction } from "@/app/actions/profile";
import {
  PROFILE_GENDERS,
  PROFILE_LEVELS,
  fitnessLevelToRunStrength,
} from "@/lib/profile-basics";
import { appToast } from "@/lib/toast-store";

type BasicsSnapshot = {
  name: string;
  gender: "male" | "female" | "other" | "";
  level: "beginner" | "intermediate" | "advanced" | "";
};

export function ProfileBasicsEditor() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const editSnapshot = useRef<BasicsSnapshot | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "">("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getMyProfileAction();
      if (cancelled) return;
      if (res.ok && res.data.profile) {
        const p = res.data.profile;
        const n = p.name?.trim() || "";
        const g =
          p.gender === "male" || p.gender === "female" || p.gender === "other" ? p.gender : "";
        const lv =
          p.fitness_level === "beginner" ||
          p.fitness_level === "intermediate" ||
          p.fitness_level === "advanced"
            ? p.fitness_level
            : "";
        setName(n);
        setGender(g);
        setLevel(lv);
        if (!g || !lv) setEditing(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !level) {
      appToast.error("Kies geslacht en niveau.");
      return;
    }
    startTransition(async () => {
      const { run, strength } = fitnessLevelToRunStrength(level);
      const res = await updateMyProfileBasicsAction({
        name,
        gender,
        runLevel: run,
        strengthLevel: strength,
      });
      if (!res.ok) {
        appToast.error(res.error);
        return;
      }
      appToast.success("Profiel bijgewerkt.");
      setEditing(false);
      editSnapshot.current = null;
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
    });
  };

  const startEdit = () => {
    editSnapshot.current = { name, gender, level };
    setEditing(true);
  };

  const cancelEdit = () => {
    const s = editSnapshot.current;
    if (s) {
      setName(s.name);
      setGender(s.gender);
      setLevel(s.level);
    }
    editSnapshot.current = null;
    setEditing(false);
  };

  const genderLabel = gender ? PROFILE_GENDERS.find((g) => g.id === gender)?.label : null;
  const levelLabel = level ? PROFILE_LEVELS.find((l) => l.id === level)?.label : null;

  if (loading) {
    return (
      <div className="flex min-h-[120px] items-center justify-center text-sm text-muted">
        <div
          className="size-8 rounded-full border-2 border-edge border-t-gold animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="mt-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-sm font-bold">Jouw gegevens</h2>
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 rounded-xl border border-edge-hover bg-canvas px-3 py-2 text-xs font-semibold text-ink hover:border-gold/40"
          >
            Bewerken
          </button>
        </div>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Naam</dt>
            <dd className="font-medium text-ink">{name.trim() ? name : "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Geslacht</dt>
            <dd className="text-ink">{genderLabel ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Niveau</dt>
            <dd className="text-ink">{levelLabel ?? "—"}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-sm font-bold">Jouw gegevens</h2>
        <button
          type="button"
          onClick={cancelEdit}
          className="shrink-0 text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Annuleren
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <label className="block space-y-1 text-xs font-semibold uppercase tracking-wide text-muted">
        Weergavenaam
        <input
          required
          minLength={2}
          className="mt-1 w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink outline-none focus:border-gold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hoe noemen we je in de app?"
        />
      </label>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Geslacht</p>
        <div className="mt-2 grid gap-2">
          {PROFILE_GENDERS.map((g) => (
            <label
              key={g.id}
              className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition ${
                gender === g.id ? "border-gold bg-gold/10 text-gold" : "border-edge bg-canvas"
              }`}
            >
              <input
                type="radio"
                name="gender-edit"
                value={g.id}
                checked={gender === g.id}
                onChange={() => setGender(g.id)}
                className="size-4 accent-gold"
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trainingsniveau</p>
        <div className="mt-2 grid gap-2">
          {PROFILE_LEVELS.map((lv) => (
            <label
              key={lv.id}
              className={`flex min-h-10 cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2 text-sm transition ${
                level === lv.id ? "border-gold bg-gold/10 text-gold" : "border-edge bg-canvas"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="level-edit"
                  value={lv.id}
                  checked={level === lv.id}
                  onChange={() => setLevel(lv.id)}
                  className="size-4 accent-gold"
                />
                <span className="font-semibold">{lv.label}</span>
              </span>
              <span className="pl-7 text-[11px] text-muted">{lv.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-11 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
      >
        {pending ? "Opslaan…" : "Gegevens opslaan"}
      </button>
    </form>
    </div>
  );
}
