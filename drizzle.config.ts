import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude Titus memory tables - managed separately (see src/lib/db/TITUS_TABLES.md)
  tablesFilter: ["!titus_*"],
} satisfies Config;
