import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Singleton database instance
let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

// Lazy-loaded database getter
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const sql = neon(getDatabaseUrl());
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Export db as a proxy that lazily initializes
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

// Re-export schema for convenience
export * from "./schema";
