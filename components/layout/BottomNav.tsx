"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, Home, LayoutGrid, TrendingUp, UserRound } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/workout/vandaag", label: "Vandaag", Icon: CalendarDays },
  { href: "/plan", label: "Plan", Icon: LayoutGrid },
  { href: "/stations", label: "Stations", Icon: Dumbbell },
  { href: "/prs", label: "PR’s", Icon: TrendingUp },
  { href: "/profile", label: "Profiel", Icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 rounded-full border border-white/[0.08] bg-[#121214]/92 px-1.5 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-center justify-between gap-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold tracking-wide transition-all ${
                active
                  ? "text-neon-hot drop-shadow-[0_0_12px_rgba(212,255,0,0.35)]"
                  : "text-muted hover:text-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className="size-[1.35rem] shrink-0"
                strokeWidth={active ? 2.25 : 1.65}
                aria-hidden
              />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
