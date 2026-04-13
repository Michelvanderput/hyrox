"use client";

import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Refreshes the browser Supabase session periodically. We intentionally avoid
 * Edge middleware (Vercel + @supabase/ssr there caused MIDDLEWARE_INVOCATION_FAILED).
 */
export function SupabaseSessionSync() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const touch = () => {
      void supabase.auth.getSession();
    };

    touch();
    window.addEventListener("focus", touch);
    const interval = window.setInterval(touch, 50 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", touch);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
