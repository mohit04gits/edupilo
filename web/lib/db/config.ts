export interface MongoConfig {
  uri: string;
  databaseName: string;
}
export function readMongoConfig(env: NodeJS.ProcessEnv = process.env): MongoConfig {
  const uri = env.MONGODB_URI?.trim(),
    databaseName = env.MONGODB_DB_NAME?.trim() || "edupilo";
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://"))
    throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://");
  if (/REPLACE_WITH|<db_password>|<password>/i.test(uri))
    throw new Error("MONGODB_URI still contains a password placeholder");
  if ((uri.match(/@/g) ?? []).length !== 1)
    throw new Error("MONGODB_URI credentials contain an unescaped @; URL-encode it as %40");
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(databaseName))
    throw new Error("MONGODB_DB_NAME contains unsupported characters");
  return { uri, databaseName };
}
