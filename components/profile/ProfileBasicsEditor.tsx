"use client";

import { useEffect, useState, useTransition } from "react";

import { getMyProfileAction, updateMyProfileBasicsAction } from "@/app/actions/profile";
import {
  PROFILE_GENDERS,
  PROFILE_LEVELS,
  fitnessLevelToRunStrength,
} from "@/lib/profile-basics";
import { appToast } from "@/lib/toast-store";

export function ProfileBasicsEditor() {
  const [loading, setLoading] = useState(true);
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
        setName(p.name?.trim() || "");
        setGender(p.gender === "male" || p.gender === "female" || p.gender === "other" ? p.gender : "");
        setLevel(
          p.fitness_level === "beginner" ||
            p.fitness_level === "intermediate" ||
            p.fitness_level === "advanced"
            ? p.fitness_level
            : "",
        );
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
      window.dispatchEvent(new Event("hyrox-workspace-refresh"));
    });
  };

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

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-4">
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
  );
}
