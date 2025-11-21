
import { db } from "../storage/index";
import { users } from "../storage/schema";
export async function seedDefaultUser() {
  const existing = await db.select().from(users).limit(1);

  if (existing.length > 0) {
    console.log("User exists, skipping");
    return;
  }

  console.log("Seeding default user...");

  await db.insert(users).values({
    username: "Guest",
    email: "guest@example.com",
    password: "",
    google: 0,
    photo: "",
    fitness_goal: "lose fat",
  });

  console.log("User seeded");
}
