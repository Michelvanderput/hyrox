"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[hyrox] route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-xl font-bold text-ink">Er ging iets mis</h1>
      <p className="text-sm text-muted">
        {error.message || "Onbekende fout. Probeer opnieuw of ga terug naar home."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-11 rounded-xl bg-gold px-5 text-sm font-bold text-canvas"
        >
          Opnieuw proberen
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-edge-hover bg-panel px-5 text-sm font-semibold text-ink"
        >
          Naar home
        </Link>
      </div>
    </div>
  );
}
