import { electrify } from "electric-sql/expo"
import { sqlite } from "../utils/storage"
import * as schema from "./storage/schema"

export async function initElectric() {
  const electric = await electrify(
    sqlite,   // ✅ Electric-compatible DB
    schema,   // ✅ Same schema Drizzle uses
    {
      url: "ws://YOUR_IP:5133",
    }
  )

  return electric
}