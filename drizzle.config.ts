import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./app/utils/storage/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: 'expo',
})