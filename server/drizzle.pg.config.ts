import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/schema.pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",

  dbCredentials: {
    host: "localhost",      // 👈 IMPORTANT
    port: 5432,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "fitgo",
  },
});
