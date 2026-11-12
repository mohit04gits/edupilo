import "server-only";
import bcrypt from "bcrypt";
const DUMMY_HASH = "$2b$12$Q8H6mVBK6wDgHf7x8F5tH.VWMyDFH7eHGcP1nUQoXqO8T14jD8x8m";
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPasswordSafely = (password: string, hash?: string) =>
  bcrypt.compare(password, hash ?? DUMMY_HASH);
