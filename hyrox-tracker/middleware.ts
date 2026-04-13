import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Keep Edge middleware self-contained: no imports from ./lib (cleaner bundle)
 * and dynamic-import @supabase/ssr so a bad Edge load surfaces as a caught error.
 *
 * Set DISABLE_EDGE_SUPABASE_REFRESH=1 on Vercel if you still see MIDDLEWARE_INVOCATION_FAILED.
 */
export async function middleware(request: NextRequest) {
  if (process.env.DISABLE_EDGE_SUPABASE_REFRESH === "1") {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          const cacheHeaders = headers ?? {};
          cookiesToSet.forEach(({ name, value }) => {
            try {
              request.cookies.set(name, value);
            } catch {
              /* request cookies may be immutable */
            }
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, options);
            } catch {
              /* skip invalid cookie */
            }
          });
          Object.entries(cacheHeaders).forEach(([headerName, headerValue]) => {
            response.headers.set(headerName, headerValue);
          });
        },
      },
    });

    await supabase.auth.getSession().catch(() => null);
  } catch {
    response = NextResponse.next({ request });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
