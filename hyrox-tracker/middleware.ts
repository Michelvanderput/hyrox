import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "./lib/supabase/middleware";

/**
 * Vercel routes this reliably as Edge middleware. `proxy.ts` (Node) has
 * caused NOT_FOUND for some deployments; session refresh stays in updateSession.
 */
export async function middleware(request: NextRequest) {
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
