import "server-only";
export const AUTH_COOKIE_NAME = "edupilo_session";
export const AUTH_ISSUER = "edupilo";
export const AUTH_AUDIENCE = "edupilo-web";
export const AUTH_SESSION_SECONDS = 604800;
export function getJwtSecret(env: NodeJS.ProcessEnv = process.env): Uint8Array {
  const value = env.JWT_SECRET?.trim();
  if (!value || value.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}
