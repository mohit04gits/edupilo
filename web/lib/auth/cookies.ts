import "server-only";
import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_SESSION_SECONDS } from "./config";
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_SESSION_SECONDS,
};
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, options);
}
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", { ...options, maxAge: 0, expires: new Date(0) });
}
