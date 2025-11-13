import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets } from "@/utils/storage/schema";
import cuid from "cuid";
import { eq } from "drizzle-orm";

export async function seedPreMadeRoutines() {
  // ✅ Check if pre-made routines already exist
  const existing = await db.select().from(routines).where(eq(routines.isPreMade, 1));

  if (existing.length > 0) {
    console.log("✅ Pre-made routines already exist — skipping seeding.");
    return;
  }

  console.log("🌱 Seeding pre-made routines...");

  const preMadeRoutines = [
    {
      id: cuid(),
      name: "Full Body Beginner",
      description: "A balanced full-body routine for beginners, 3 times a week.",
      level: "beginner",
      isPreMade: 1,
    },
    {
      id: cuid(),
      name: "Push Pull Legs Split",
      description: "Classic 6-day split focusing on upper/lower alternation.",
      level: "intermediate",
      isPreMade: 1,
    },
    
  ];

  await db.insert(routines).values(preMadeRoutines);

  // Example exercise IDs — replace with real IDs from your `exercises` table
  const exerciseMap = {
    barbellSquat: "cmhtpkevv000eypto2pc5bt4j",
    benchPress: "cmhtpket70000yptotczhcmqo",
    deadlift: "cmhtpkexy000pyptoeq72tjwq",
   
    
  };

  // ✅ Explicitly cast the unit and repsType to satisfy Drizzle's literal types
  const routineExercisesData = [
    {
      id: cuid(),
      routineId: preMadeRoutines[0].id,
      exerciseId: exerciseMap.barbellSquat,
      unit: "kg" as const,
      repsType: "reps" as const,
      restTimer: 90,
    },
    {
      id: cuid(),
      routineId: preMadeRoutines[0].id,
      exerciseId: exerciseMap.benchPress,
      unit: "kg" as const,
      repsType: "reps" as const,
      restTimer: 90,
    },
    {
      id: cuid(),
      routineId: preMadeRoutines[1].id,
      exerciseId: exerciseMap.deadlift,
      unit: "kg" as const,
      repsType: "reps" as const,
      restTimer: 180,
    },
  ];

  await db.insert(routineExercises).values(routineExercisesData);

  // ✅ Explicitly cast setType as one of the defined literals
  const routineSetsData = [
    {
      id: cuid(),
      routineId: preMadeRoutines[0].id,
      exerciseId: exerciseMap.barbellSquat,
      weight: 50,
      reps: 10,
      setType: "Normal" as const,
    },
    {
      id: cuid(),
      routineId: preMadeRoutines[0].id,
      exerciseId: exerciseMap.barbellSquat,
      weight: 55,
      reps: 8,
      setType: "Normal" as const,
    },
    {
      id: cuid(),
      routineId: preMadeRoutines[0].id,
      exerciseId: exerciseMap.benchPress,
      weight: 40,
      reps: 10,
      setType: "Normal" as const,
    },
    {
      id: cuid(),
      routineId: preMadeRoutines[1].id,
      exerciseId: exerciseMap.deadlift,
      weight: 70,
      reps: 5,
      setType: "Normal" as const,
    },
    
  ];

  await db.insert(routineSets).values(routineSetsData);

  console.log("✅ Pre-made routines seeded successfully!");
}
