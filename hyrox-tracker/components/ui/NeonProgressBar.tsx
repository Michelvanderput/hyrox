"use client";

/**
 * Horizontale voortgangsbalk in referentie-stijl: gradient + subtiele diagonale strepen.
 */
export function NeonProgressBar({
  value,
  className = "",
}: {
  /** 0–100 */
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="hyrox-neon-fill relative h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
