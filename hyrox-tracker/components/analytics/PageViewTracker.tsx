"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageview } from "@/lib/analytics";

/**
 * Stuurt een pageview bij elke navigatie (App Router).
 * Moet in een client tree met Suspense-boundary rond `useSearchParams`.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams?.toString();

  useEffect(() => {
    const path = `${pathname}${qs ? `?${qs}` : ""}`;
    trackPageview(path);
  }, [pathname, qs]);

  return null;
}
