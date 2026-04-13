"use client";

import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * Houdt Supabase-sessie warm: focus, tab zichtbaar, interval (iets korter als PWA op homescreen).
 */
export function SupabaseSessionSync() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const touch = () => {
      void supabase.auth.getSession();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") touch();
    };

    touch();
    window.addEventListener("focus", touch);
    document.addEventListener("visibilitychange", onVisible);

    const intervalMs = isStandaloneDisplay() ? 20 * 60 * 1000 : 45 * 60 * 1000;
    const interval = window.setInterval(touch, intervalMs);

    return () => {
      window.removeEventListener("focus", touch);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
