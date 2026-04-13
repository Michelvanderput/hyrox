"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const isHttps =
    typeof window !== "undefined" ? window.location.protocol === "https:" : true;
  return createBrowserClient<Database>(url, key, {
    cookieOptions: {
      sameSite: "lax",
      secure: isHttps,
      path: "/",
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
