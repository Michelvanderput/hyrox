import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-canvas pt-[env(safe-area-inset-top,0px)] text-ink">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -right-32 -top-40 size-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)]" />
        <div className="absolute -left-24 top-1/3 size-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(163,255,51,0.06),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col px-3 pb-[calc(10rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-4 sm:pb-[calc(11rem+env(safe-area-inset-bottom,0px))] sm:pt-7">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
