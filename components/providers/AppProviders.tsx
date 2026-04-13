"use client";

import { Suspense } from "react";

import { SupabaseSessionSync } from "@/components/auth/SupabaseSessionSync";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SupabaseSessionSync />
      <ServiceWorkerRegister />
      {children}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <ToastViewport />
    </>
  );
}
