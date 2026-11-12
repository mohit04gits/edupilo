import { NextRequest, NextResponse } from "next/server";
import {
  clientAddress,
  consumeRateLimit,
  createSessionToken,
  findAuthUserByEmail,
  getJwtSecret,
  isSameOrigin,
  resetRateLimit,
  setSessionCookie,
  validateCredentials,
  verifyPasswordSafely,
} from "@/lib/auth";
import { invalidOrigin, jsonError, rateLimited } from "@/lib/http/responses";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const TOO_MANY = "Too many login attempts. Try again later.";
const invalidCredentials = () =>
  jsonError("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return invalidOrigin();
  try {
    getJwtSecret();
  } catch {
    console.error("[auth] JWT_SECRET is not configured");
    return jsonError("AUTH_UNAVAILABLE", "Authentication is not configured yet.", 503);
  }

  const ipLimit = consumeRateLimit(`login-ip:${clientAddress(request.headers)}`, 20, WINDOW_MS);
  if (!ipLimit.allowed) return rateLimited(TOO_MANY, ipLimit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidCredentials();
  }
  const parsed = validateCredentials(body);
  if (!parsed.ok) return invalidCredentials();

  const accountKey = `login-account:${parsed.value.email}`;
  const accountLimit = consumeRateLimit(accountKey, 5, WINDOW_MS);
  if (!accountLimit.allowed) return rateLimited(TOO_MANY, accountLimit.retryAfterSeconds);

  try {
    const user = await findAuthUserByEmail(parsed.value.email);
    const valid = await verifyPasswordSafely(parsed.value.password, user?.passwordHash);
    if (!user || !valid || user.status !== "ACTIVE") return invalidCredentials();

    // Only failed attempts should count towards the per-account lockout.
    resetRateLimit(accountKey);
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      rolePreference: user.rolePreference,
    });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        rolePreference: user.rolePreference,
        status: user.status,
      },
    });
    setSessionCookie(response, token);
    return response;
  } catch {
    console.error("[auth] login failed");
    return jsonError("AUTH_UNAVAILABLE", "Unable to sign in right now.", 500);
  }
}
