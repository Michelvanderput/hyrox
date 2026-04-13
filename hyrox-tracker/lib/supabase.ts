/**
 * @deprecated Prefer `createSupabaseBrowserClient` from `@/lib/supabase/client`.
 */
export { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient();
}
