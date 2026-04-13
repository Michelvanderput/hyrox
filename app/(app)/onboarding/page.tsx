import Link from "next/link";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="pb-8 pt-2">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-ink"
        >
          ← Dashboard
        </Link>
      </div>
      <OnboardingForm />
    </div>
  );
}
