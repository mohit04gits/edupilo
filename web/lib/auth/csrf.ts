import type { NextRequest } from "next/server";
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin"),
    host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))
      ?.split(",")[0]
      ?.trim(),
    protocol =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      request.nextUrl.protocol.replace(":", "");
  if (!origin || !host) return false;
  try {
    const source = new URL(origin);
    return source.host === host && source.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}
