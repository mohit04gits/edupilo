import mongoose, { type Mongoose } from "mongoose";
import { readMongoConfig } from "./config";
type ConnectionCache = { connection: Mongoose | null; pending: Promise<Mongoose> | null };
declare global {
  var __edupiloMongoCache: ConnectionCache | undefined;
}
const cache: ConnectionCache = globalThis.__edupiloMongoCache ?? {
  connection: null,
  pending: null,
};
if (process.env.NODE_ENV !== "production") globalThis.__edupiloMongoCache = cache;
mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);
export async function connectMongo(): Promise<Mongoose> {
  if (typeof window !== "undefined") throw new Error("MongoDB connections are server-only");
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (!cache.pending) {
    const { uri, databaseName } = readMongoConfig();
    cache.pending = mongoose
      .connect(uri, {
        dbName: databaseName,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        maxPoolSize: 5,
        minPoolSize: 0,
        autoIndex: process.env.NODE_ENV !== "production",
        bufferCommands: false,
      })
      .then((connected) => {
        cache.connection = connected;
        return connected;
      })
      .catch((error: unknown) => {
        cache.pending = null;
        throw new Error("MongoDB connection failed", { cause: error });
      });
  }
  return cache.pending;
}
export async function disconnectMongo(): Promise<void> {
  if (cache.connection || cache.pending) await mongoose.disconnect();
  cache.connection = null;
  cache.pending = null;
}
