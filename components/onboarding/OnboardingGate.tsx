"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getMyProfileAction } from "@/app/actions/profile";
import { useTrainingCloud } from "@/context/TrainingCloudContext";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { userId } = useTrainingCloud();
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  useLayoutEffect(() => {
    routerRef.current = router;
  }, [router]);

  const needsProfileGate = useMemo(() => {
    if (!userId) return false;
    if (pathname?.startsWith("/onboarding")) return false;
    if (pathname?.startsWith("/login")) return false;
    return true;
  }, [pathname, userId]);

  const [ready, setReady] = useState(!needsProfileGate);

  useEffect(() => {
    if (!needsProfileGate) {
      startTransition(() => setReady(true));
      return;
    }

    startTransition(() => setReady(false));
    let cancelled = false;

    void (async () => {
      const res = await getMyProfileAction();
      if (cancelled) return;
      if (!res.ok) {
        startTransition(() => setReady(true));
        return;
      }
      const p = res.data.profile;
      if (!p || !p.onboarding_completed) {
        routerRef.current.replace("/onboarding");
        return;
      }
      startTransition(() => setReady(true));
    })();

    return () => {
      cancelled = true;
    };
  }, [needsProfileGate, userId]);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-canvas/96 px-6 text-center">
        <div
          className="size-10 rounded-full border-2 border-edge border-t-gold animate-spin"
          aria-hidden
        />
        <p className="text-sm text-muted">Profiel en team-workspace voorbereiden…</p>
      </div>
    );
  }

  return <>{children}</>;
}
