"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { completeOnboardingAction, getMyProfileAction } from "@/app/actions/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { appToast } from "@/lib/toast-store";

const GENDERS = [
  { id: "male" as const, label: "Man (open-gewichten)" },
  { id: "female" as const, label: "Vrouw (open-gewichten)" },
  { id: "other" as const, label: "Anders / liever niet zeggen" },
];

const LEVELS = [
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

function fitnessToIntensity(
  l: "beginner" | "intermediate" | "advanced",
): { run: 1 | 2 | 3; strength: 1 | 2 | 3 } {
  if (l === "beginner") return { run: 1, strength: 1 };
  if (l === "advanced") return { run: 3, strength: 3 };
  return { run: 2, strength: 2 };
}

export function OnboardingForm() {
  const router = useRouter();
  const routerRef = useRef(router);
  useLayoutEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "">("");
  const [pending, startUiTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured()) {
      startUiTransition(() => setLoading(false));
      return () => {
        cancelled = true;
      };
    }
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      startUiTransition(() => setLoading(false));
      return () => {
        cancelled = true;
      };
    }
    void (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (cancelled) return;
      if (!user) {
        routerRef.current.replace("/login");
        return;
      }
      const res = await getMyProfileAction();
      if (cancelled) return;
      if (res.ok && res.data.profile) {
        const p = res.data.profile;
        setName(p.name?.trim() || "");
        setGender(p.gender ?? "");
        setLevel(p.fitness_level ?? "");
      }
      startUiTransition(() => setLoading(false));
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
    startUiTransition(async () => {
      const { run, strength } = fitnessToIntensity(level);
      const res = await completeOnboardingAction({
        name,
        gender,
        runLevel: run,
        strengthLevel: strength,
        team: { mode: "later" },
      });
      if (!res.ok) {
        appToast.error(res.error);
        return;
      }
      appToast.success("Profiel opgeslagen. Veel succes met het plan!");
      router.replace("/profile");
      router.refresh();
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-muted">
        <div
          className="size-10 rounded-full border-2 border-edge border-t-gold animate-spin"
          aria-hidden
        />
        Profiel laden…
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted">
        Supabase is niet geconfigureerd.{" "}
        <Link href="/" className="text-gold underline underline-offset-4">
          Terug naar dashboard
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-6">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Welkom
        </p>
        <h1 className="font-heading text-2xl font-black tracking-tight text-ink">
          Stel je profiel in
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Dit helpt bij station-gewichten in de encyclopedie en houdt jullie setup strak. Je kunt dit
          later opnieuw aanpassen via Profiel.
        </p>
      </header>

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <label className="block space-y-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Weergavenaam
          <input
            required
            minLength={2}
            className="w-full min-h-11 rounded-xl border border-edge bg-canvas px-3 text-sm text-ink outline-none focus:border-gold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hoe noemen we je in de app?"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold text-ink">Geslacht</h2>
        <p className="mt-1 text-[11px] text-muted">Voor standaard HYROX open-gewichten in uitleg.</p>
        <div className="mt-4 grid gap-2">
          {GENDERS.map((g) => (
            <label
              key={g.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition ${
                gender === g.id ? "border-gold bg-gold/10 text-gold" : "border-edge bg-canvas"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={g.id}
                checked={gender === g.id}
                onChange={() => setGender(g.id)}
                className="size-4 accent-gold"
              />
              {g.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-edge bg-panel p-4 sm:p-5">
        <h2 className="font-heading text-sm font-bold text-ink">Trainingsniveau</h2>
        <p className="mt-1 text-[11px] text-muted">Gebruikt voor toon en toekomstige presets.</p>
        <div className="mt-4 grid gap-2">
          {LEVELS.map((lv) => (
            <label
              key={lv.id}
              className={`flex min-h-11 cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2 text-sm transition ${
                level === lv.id ? "border-gold bg-gold/10 text-gold" : "border-edge bg-canvas"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="level"
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
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-12 rounded-xl bg-gold text-sm font-bold text-canvas disabled:opacity-50"
      >
        {pending ? "Opslaan…" : "Opslaan en verder"}
      </button>

      <p className="text-center text-[11px] text-faint">
        Door op te slaan bevestig je dat je gegevens kloppen.{" "}
        <Link href="/login" className="text-muted underline underline-offset-4">
          Uitloggen
        </Link>
      </p>
    </form>
  );
}
