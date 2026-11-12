import "server-only";
import { NextResponse } from "next/server";

export function jsonError(
  code: string,
  message: string,
  status: number,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

export function rateLimited(message: string, retryAfterSeconds: number): NextResponse {
  return jsonError("RATE_LIMITED", message, 429, { "Retry-After": String(retryAfterSeconds) });
}

export const invalidOrigin = (): NextResponse =>
  jsonError("INVALID_ORIGIN", "Request origin is not allowed.", 403);

export const unauthorized = (): NextResponse =>
  jsonError("UNAUTHORIZED", "Sign in to continue.", 401);
