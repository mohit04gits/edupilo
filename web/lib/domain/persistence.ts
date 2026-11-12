import type { IsoTimestamp } from "./types";
/** Persistence envelope only; domain records do not depend on MongoDB or Mongoose. */
export interface PersistedRecord<T> {
  schemaVersion: number;
  revision: number;
  value: T;
  storedAt: IsoTimestamp;
}
export interface PersistenceMapper<TDomain, TPersistence> {
  toPersistence(domain: TDomain): TPersistence;
  toDomain(stored: TPersistence): TDomain;
}
