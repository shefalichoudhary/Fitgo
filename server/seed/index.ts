// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "../schema.pg";

// const connectionString =
//   process.env.DOCKER === "true"
//     ? process.env.DATABASE_URL
//     : process.env.DATABASE_URL_LOCAL;

// if (!connectionString) {
//   throw new Error("❌ No valid DATABASE_URL found");
// }

// export const pool = new Pool({
//   connectionString,
//   ssl: false,
// });

// export const db = drizzle(pool, { schema });
