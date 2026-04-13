"use client";

import { useToastStore } from "@/lib/toast-store";

const toneClass: Record<string, string> = {
  error: "border-race/40 bg-race/10 text-race",
  success: "border-success/40 bg-success/10 text-success",
  info: "border-edge-hover bg-panel text-ink",
};

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-3 sm:bottom-32"
      aria-live="polite"
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-lg backdrop-blur-md transition active:scale-[0.99] ${toneClass[t.tone] ?? toneClass.info}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
          <span className="mt-1 block text-[10px] font-normal opacity-70">Tik om te sluiten</span>
        </button>
      ))}
    </div>
  );
}
