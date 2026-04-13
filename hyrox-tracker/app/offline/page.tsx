import Link from "next/link";

export const metadata = {
  title: "Offline — HYROX",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-black px-6 text-center text-ink">
      <div className="font-heading text-2xl font-black text-transparent bg-gradient-to-r from-cyan via-neon to-neon-hot bg-clip-text">
        Geen verbinding
      </div>
      <p className="max-w-sm text-sm text-muted">
        Je bent offline of het netwerk hapert. Eerder bezochte pagina’s kunnen nog beschikbaar zijn zodra de
        cache ze heeft opgeslagen.
      </p>
      <Link
        href="/"
        className="hyrox-btn-primary inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold"
      >
        Probeer opnieuw
      </Link>
    </div>
  );
}
