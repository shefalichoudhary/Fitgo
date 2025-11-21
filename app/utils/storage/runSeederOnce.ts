import AsyncStorage from "@react-native-async-storage/async-storage";
import { InsertSeedDataOnce } from "./insertSeedData";
import { seedPreMadeRoutines } from "./SeedPreMadeRoutines";
import { seedDefaultUser } from "./seedDefaultUser";

export async function runSeedersOnce() {
  try {
    const hasSeeded = await AsyncStorage.getItem("HAS_SEEDED");

    if (hasSeeded === "true") {
      console.log("✔️ Seed already completed — skipping");
      return;
    }

    console.log("🌱 Running initial seed...");
    await InsertSeedDataOnce();
    await seedPreMadeRoutines();
    await seedDefaultUser();


    await AsyncStorage.setItem("HAS_SEEDED", "true");
    console.log("✔️ Seed successfully saved flag");
    
  } catch (err) {
    console.error("❌ Seeder error:", err);
  }
}
