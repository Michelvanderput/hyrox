import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "./lib/supabase/middleware";

/**
 * Next.js 16+: use `proxy` (Node.js runtime). Deprecated `middleware` runs on
 * Edge and often breaks Supabase session refresh on Vercel.
 */
export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
