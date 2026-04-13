import Link from "next/link";

import { InviteJoinPanel, type TeamPreview } from "@/components/invite/InviteJoinPanel";
import { createSupabaseServerClientIfConfigured } from "@/lib/supabase/server";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim();

  let preview: TeamPreview | null = null;
  const supabase = await createSupabaseServerClientIfConfigured();
  if (supabase && normalized) {
    const { data, error } = await supabase.rpc("team_preview_by_code", {
      p_code: normalized,
    });
    if (!error && data && data.length > 0) {
      preview = data[0] as TeamPreview;
    }
  }

  return (
    <div className="min-h-dvh bg-canvas px-4 py-10 text-ink">
      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-edge bg-panel p-6">
        <h1 className="font-heading text-2xl font-black">Team uitnodiging</h1>
        <p className="text-sm text-muted">
          Code: <span className="font-mono text-gold">{normalized}</span>
        </p>

        {!supabase && (
          <p className="text-sm text-muted">
            Supabase is niet geconfigureerd op deze omgeving — invite preview werkt pas na env
            setup.
          </p>
        )}

        <InviteJoinPanel code={normalized} preview={preview} />

        <Link
          href="/"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-edge-hover bg-canvas px-4 text-sm font-semibold hover:border-gold/40"
        >
          ← Naar dashboard
        </Link>
      </div>
    </div>
  );
}
