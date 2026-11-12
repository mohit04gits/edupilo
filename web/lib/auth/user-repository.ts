import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "../db/connection";
import { UserModel } from "../db/models";
import type { AuthRole } from "./validation";
export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  rolePreference?: AuthRole;
  status: "ACTIVE" | "SUSPENDED" | "DELETION_PENDING" | "PENDING_AUTH";
}
export type PublicUser = Omit<AuthUser, "passwordHash">;
type UserRow = {
  _id: Types.ObjectId;
  emailNormalized: string;
  passwordHash?: string;
  rolePreference?: AuthRole;
  status: AuthUser["status"];
};
const publicUser = (row: UserRow): PublicUser => ({
  id: row._id.toHexString(),
  email: row.emailNormalized,
  rolePreference: row.rolePreference,
  status: row.status,
});
export class DuplicateEmailError extends Error {}
export async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  await connectMongo();
  const row = (await UserModel.findOne({ emailNormalized: email })
    .select("+passwordHash")
    .lean()) as UserRow | null;
  return row?.passwordHash ? { ...publicUser(row), passwordHash: row.passwordHash } : null;
}
export async function findPublicUserById(id: string): Promise<PublicUser | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectMongo();
  const row = (await UserModel.findById(id).lean()) as UserRow | null;
  return row ? publicUser(row) : null;
}
export async function createLocalUser(input: {
  email: string;
  passwordHash: string;
  rolePreference?: AuthRole;
}): Promise<PublicUser> {
  await connectMongo();
  const now = new Date();
  try {
    const row = (await UserModel.create({
      authSubject: `local:${input.email}`,
      emailNormalized: input.email,
      passwordHash: input.passwordHash,
      rolePreference: input.rolePreference,
      preferredLanguage: "en-IN",
      consentVersions: {},
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    })) as unknown as UserRow;
    return publicUser(row);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    )
      throw new DuplicateEmailError();
    throw error;
  }
}
