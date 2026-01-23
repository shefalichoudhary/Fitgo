// import { db } from "./seed/index";
// import { sql } from "drizzle-orm";

// async function main() {
//   const result = await db.execute(
//     sql`
//       SELECT table_name
//       FROM information_schema.tables
//       WHERE table_schema = 'public'
//       ORDER BY table_name;
//     `
//   );

//   console.log("📋 Tables in database:");
//   console.table(result.rows);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error("❌ Failed to check tables:", err);
//     process.exit(1);
//   });
