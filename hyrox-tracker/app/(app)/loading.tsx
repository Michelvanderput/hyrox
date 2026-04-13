export default function AppLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
      <div
        className="size-11 rounded-full border-2 border-edge border-t-gold animate-spin"
        aria-hidden
      />
      <p className="text-sm text-muted">Laden…</p>
    </div>
  );
}
