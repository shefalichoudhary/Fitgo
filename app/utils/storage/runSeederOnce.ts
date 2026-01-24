import AsyncStorage from "@react-native-async-storage/async-storage";
import { InsertSeedDataOnce } from "./insertSeedData";
import { seedPreMadeRoutines } from "./SeedPreMadeRoutines";
import { seedDefaultUser } from "./seedDefaultUser";

const SEED_VERSION = "v5";

export async function runSeedersOnce() {
  const version = await AsyncStorage.getItem("SEED_VERSION");

  if (version === SEED_VERSION) {
    console.log("✔️ Seed already completed — skipping");
    return;
  }

  console.log("🌱 Running initial seed...");
  await InsertSeedDataOnce();
  await seedPreMadeRoutines();
  await seedDefaultUser();

  await AsyncStorage.setItem("SEED_VERSION", SEED_VERSION);
}