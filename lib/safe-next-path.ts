/** Voorkom open redirects: alleen relatieve paden binnen dezelfde origin. */
export function safeInternalPath(next: string | null | undefined, fallback = "/"): string {
  if (next == null) return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("://")) return fallback;
  return t;
}
