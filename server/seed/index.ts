// server/db.ts
import "dotenv/config"; // ✅ MUST be first
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema.pg";

// Decide which DB URL to use
// If running inside Docker, use DATABASE_URL
// If running locally (npm run seed), use DATABASE_URL_LOCAL
const connectionString =
  process.env.DOCKER === "true"
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL_LOCAL;

if (!connectionString) {
  throw new Error("❌ No valid DATABASE_URL found");
}

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
