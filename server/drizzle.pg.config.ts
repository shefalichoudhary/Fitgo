// server/drizzle.pg.config.ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./server/schema.pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
})