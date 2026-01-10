import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { electrify } from "electric-sql/expo";
import * as schema from "./schema";

let sqlite: ReturnType<typeof openDatabaseSync>;
let db: ReturnType<typeof drizzle>;
let electric: any;

export async function initDB() {
  if (db) {
    return { db, sqlite, electric };
  }

  // 1️⃣ Open SQLite once
  sqlite = openDatabaseSync("fitgo.db");

  // 2️⃣ Electrify — FORCE correct overload
  electric = await electrify(
    sqlite as any,
    {
      url: "ws://YOUR_IP:5133",
      app: "fitgo",
      env: "dev",
    } as any
  );

  // 3️⃣ Init Drizzle
  db = drizzle(sqlite, { schema });

  return { db, sqlite, electric };
}

export { db, sqlite };
