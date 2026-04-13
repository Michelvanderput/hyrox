"use client";

import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Zelfstandig blok met eigen knop (niet binnen een andere form). */
export function AccountPasswordForm() {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured || !supabase) return null;

  const onSave = async () => {
    setMsg(null);
    if (newPassword.length < 6) {
      setMsg("Wachtwoord moet minstens 6 tekens zijn.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg("Wachtwoorden komen niet overeen.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setMsg("Wachtwoord opgeslagen. Je kunt op /login met e-mail + wachtwoord inloggen.");
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Inlogwachtwoord</h3>
      <p className="text-[11px] text-muted">
        Optioneel: stel een wachtwoord in voor sneller inloggen (naast magic link).
      </p>
      <label className="block space-y-1 text-xs font-semibold text-muted">
        Nieuw wachtwoord
        <input
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full min-h-10 rounded-xl border border-edge bg-canvas px-3 text-sm"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </label>
      <label className="block space-y-1 text-xs font-semibold text-muted">
        Bevestigen
        <input
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full min-h-10 rounded-xl border border-edge bg-canvas px-3 text-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        className="w-full min-h-10 rounded-xl border border-edge-hover bg-canvas text-sm font-semibold hover:border-gold/40 disabled:opacity-50"
        onClick={() => void onSave()}
      >
        {busy ? "Opslaan…" : "Wachtwoord opslaan"}
      </button>
      {msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  );
}
