export type AuthRole = "PARENT" | "TEACHER";
export interface CredentialsInput {
  email: string;
  password: string;
  rolePreference?: AuthRole;
}
export type AuthValidationResult =
  | { ok: true; value: CredentialsInput }
  | { ok: false; message: string };
export function normalizeEmail(value: string): string {
  return value.trim().normalize("NFKC").toLowerCase();
}
export function validateCredentials(value: unknown, includeRole = false): AuthValidationResult {
  if (typeof value !== "object" || value === null)
    return { ok: false, message: "Enter a valid email and password." };
  const input = value as Record<string, unknown>,
    email = typeof input.email === "string" ? normalizeEmail(input.email) : "",
    password = typeof input.password === "string" ? input.password : "",
    rolePreference = input.rolePreference;
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, message: "Enter a valid email address." };
  if (password.length < 10)
    return { ok: false, message: "Password must be at least 10 characters." };
  if (Buffer.byteLength(password, "utf8") > 72)
    return { ok: false, message: "Password must be 72 bytes or fewer." };
  if (
    includeRole &&
    rolePreference !== undefined &&
    rolePreference !== "PARENT" &&
    rolePreference !== "TEACHER"
  )
    return { ok: false, message: "Choose Parent or Teacher." };
  return {
    ok: true,
    value: {
      email,
      password,
      ...(rolePreference ? { rolePreference: rolePreference as AuthRole } : {}),
    },
  };
}
