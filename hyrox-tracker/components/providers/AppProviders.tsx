"use client";

import { Suspense } from "react";

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <ToastViewport />
    </>
  );
}
