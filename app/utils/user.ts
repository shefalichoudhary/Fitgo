import { db } from "@/utils/storage"
import { users } from "@/utils/storage/schema"

export async function getCurrentUser() {
  try {
    const result = await db.select().from(users).orderBy(users.created_at).limit(1).get()
    return result || null
  } catch (e) {
    console.error("Error fetching current user:", e)
    return null
  }
}
