import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-canvas px-4 pb-10 pt-[max(2.5rem,env(safe-area-inset-top,1rem))] text-ink">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md rounded-3xl border border-edge bg-panel p-6 text-sm text-muted">
            Laden…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
