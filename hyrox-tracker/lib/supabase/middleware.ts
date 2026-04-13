import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "../../types/database";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  try {
    const supabase = createServerClient<Database>(url, key, {
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
              // Request cookies can be read-only in some runtimes; response cookies still apply.
            }
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, options);
            } catch {
              // Invalid cookie options / size limits — skip single cookie.
            }
          });
          Object.entries(cacheHeaders).forEach(([headerName, headerValue]) => {
            response.headers.set(headerName, headerValue);
          });
        },
      },
    });

    // Prefer getSession() over getUser() in middleware: getUser() re-throws
    // session errors and always hits the auth server, which can 500 the edge.
    await supabase.auth.getSession();
  } catch {
    response = NextResponse.next({ request });
  }

  return response;
}
