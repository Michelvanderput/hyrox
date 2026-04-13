/**
 * Privacy-vriendelijke analytics: optioneel Plausible en/of GA4 via env.
 * Zonder env-vars gebeurt er niets (no-op).
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackPageview(pathWithQuery: string) {
  if (typeof window === "undefined") return;

  try {
    window.plausible?.("pageview", { props: { path: pathWithQuery } });
  } catch {
    /* ignore */
  }

  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (id && typeof window.gtag === "function") {
    try {
      window.gtag("config", id, { page_path: pathWithQuery });
    } catch {
      /* ignore */
    }
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    window.plausible?.(name, { props: params });
  } catch {
    /* ignore */
  }

  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", name, params ?? {});
    } catch {
      /* ignore */
    }
  }
}
