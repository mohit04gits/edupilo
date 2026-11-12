import { NextRequest, NextResponse } from "next/server";
import {
  clientAddress,
  consumeRateLimit,
  createLocalUser,
  createSessionToken,
  DuplicateEmailError,
  getJwtSecret,
  hashPassword,
  isSameOrigin,
  setSessionCookie,
  validateCredentials,
} from "@/lib/auth";
import { invalidOrigin, jsonError, rateLimited } from "@/lib/http/responses";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return invalidOrigin();
  try {
    getJwtSecret();
  } catch {
    console.error("[auth] JWT_SECRET is not configured");
    return jsonError("AUTH_UNAVAILABLE", "Authentication is not configured yet.", 503);
  }

  const limit = consumeRateLimit(`signup:${clientAddress(request.headers)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimited("Too many signup attempts. Try again later.", limit.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_REQUEST", "Enter a valid email and password.", 400);
  }
  const parsed = validateCredentials(body, true);
  if (!parsed.ok) return jsonError("VALIDATION_ERROR", parsed.message, 400);

  try {
    const passwordHash = await hashPassword(parsed.value.password);
    const user = await createLocalUser({
      email: parsed.value.email,
      passwordHash,
      rolePreference: parsed.value.rolePreference,
    });
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      rolePreference: user.rolePreference,
    });
    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return jsonError("EMAIL_IN_USE", "An account with this email already exists.", 409);
    }
    console.error("[auth] signup failed");
    return jsonError("AUTH_UNAVAILABLE", "Unable to create the account right now.", 500);
  }
}
