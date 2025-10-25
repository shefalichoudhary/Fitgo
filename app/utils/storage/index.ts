import { drizzle } from "drizzle-orm/expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"
import * as schema from "./schema"

// Open the database
const sqlite = openDatabaseSync("fitgo.db")

// Initialize Drizzle ORM with schema
export const db = drizzle(sqlite, { schema })

// Optional: export the raw connection
export const expo_sqlite = sqlite
