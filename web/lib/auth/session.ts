import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "./config";
import { verifySessionToken } from "./jwt";
import { findPublicUserById, type PublicUser } from "./user-repository";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims) return null;
  const user = await findPublicUserById(claims.userId);
  return user?.status === "ACTIVE" ? user : null;
}

/** Redirects to sign-in (preserving the page the adult was trying to open) when unauthenticated. */
export async function requireCurrentUser(returnTo?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
  return user;
}
