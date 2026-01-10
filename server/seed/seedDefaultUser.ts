import { db } from "./index";
import { users } from "../schema.pg";
import { InferInsertModel } from "drizzle-orm";

type UserInsert = InferInsertModel<typeof users>;

export async function seedDefaultUser() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("✔️ Default user already exists — skipping");
    return;
  }

  const user: UserInsert = {
    username: "Guest",
    email: "guest@example.com",
    password: "",
    bio: "...",
    google: 0,
    photo: "",
    fitness_goal: "lose fat",
  };

  await db.insert(users).values(user);

  console.log("✅ Default user inserted into PostgreSQL");
}
