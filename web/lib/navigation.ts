/** Routes that require an authenticated adult session. */
export const PROTECTED_PREFIXES = ["/dashboard", "/stories", "/account"] as const;

export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Accepts only same-origin, protected application paths as a post-login destination.
 * Anything else (absolute URLs, protocol-relative "//", backslashes, auth pages) falls back
 * to the dashboard so the `next` parameter cannot be used as an open redirect.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || value.length > 512) return DEFAULT_AUTHENTICATED_PATH;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }
  try {
    const url = new URL(value, "http://edupilo.local");
    if (url.origin !== "http://edupilo.local" || !isProtectedPath(url.pathname)) {
      return DEFAULT_AUTHENTICATED_PATH;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}
