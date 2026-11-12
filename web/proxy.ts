import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/navigation";

// Mirrors AUTH_COOKIE_NAME in lib/auth/config.ts (that module is server-only).
const SESSION_COOKIE = "edupilo_session";

/**
 * Optimistic route guard. It only checks that a session cookie is present; full JWT and
 * account-status verification still happens in each page via requireCurrentUser().
 * Protected responses are marked no-store so Back/Forward after sign-out cannot replay a
 * cached authenticated page.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/stories/:path*", "/account/:path*"],
};
