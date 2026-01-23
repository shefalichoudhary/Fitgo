import { drizzle } from "drizzle-orm/expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"
import * as schema from "./schema"

// Open the database
export const sqlite = openDatabaseSync("fitgo.db")

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema })

export const expo_sqlite = sqlite
