import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { AUTH_AUDIENCE, AUTH_ISSUER, AUTH_SESSION_SECONDS, getJwtSecret } from "./config";
export interface SessionClaims {
  userId: string;
  email: string;
  rolePreference?: "PARENT" | "TEACHER";
}
export async function createSessionToken(c: SessionClaims): Promise<string> {
  return new SignJWT({ email: c.email, rolePreference: c.rolePreference })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(c.userId)
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_SECONDS}s`)
    .sign(getJwtSecret());
}
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    const rolePreference = payload.rolePreference;
    if (rolePreference !== undefined && rolePreference !== "PARENT" && rolePreference !== "TEACHER")
      return null;
    return {
      userId: payload.sub,
      email: payload.email,
      ...(rolePreference ? { rolePreference } : {}),
    };
  } catch {
    return null;
  }
}
