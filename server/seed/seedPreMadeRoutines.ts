import { db } from "./index";
import { eq } from "drizzle-orm";
import {
  routines,
  routineExercises,
  routineSets,
  exercises,
} from "../schema.pg";
import seedData from "./seedData";
import { InsertSeedDataOnce } from "./insertSeedData";
import { v7 as uuidv7 } from "uuid";

/* ---------------- Types ---------------- */

type SetDef = {
  exerciseName?: string;
  exerciseId?: string;
  weight: number;
  reps: number;
  setType?: string;
};

type RoutineDef = {
  name: string;
  description?: string;
  level?: string;
  isPreMade?: number;
  exerciseNames?: string[];
  exerciseIds?: string[];
  sets?: SetDef[];
};

/* ---------------- Seeder ---------------- */

export async function seedPreMadeRoutines() {
  try {
    // 1️⃣ Ensure base exercises exist in Postgres
    await InsertSeedDataOnce();

    // 2️⃣ Skip if already seeded
    const existing = await db
      .select()
      .from(routines)
      .where(eq(routines.isPreMade, 1))
      .limit(1);

    if (existing.length > 0) {
      console.log("✅ Pre-made routines already exist — skipping.");
      return { skipped: true };
    }

    // 3️⃣ Load exercises from Postgres
    const allExercises = await db.select().from(exercises);

    const idToRow = new Map(allExercises.map((e) => [e.id, e]));
    const nameToRow = new Map(
      allExercises.map((e) => [e.exercise_name.toLowerCase(), e])
    );

    const findExercise = (input?: string | null) => {
      if (!input) return null;
      if (idToRow.has(input)) return idToRow.get(input)!;
      const lower = input.toLowerCase();
      if (nameToRow.has(lower)) return nameToRow.get(lower)!;
      return null;
    };

    // 4️⃣ Define routines
    const routineDefs: RoutineDef[] = [
      {
        name: "Full Body Beginner",
        description: "A balanced full-body routine for beginners",
        level: "beginner",
        isPreMade: 1,
        exerciseNames: ["Barbell Squat", "Bench Press", "Deadlift"],
        sets: [
          { exerciseName: "Barbell Squat", weight: 50, reps: 10 },
          { exerciseName: "Barbell Squat", weight: 55, reps: 8 },
          { exerciseName: "Bench Press", weight: 40, reps: 10 },
          { exerciseName: "Deadlift", weight: 70, reps: 5 },
        ],
      },
      {
        name: "Upper / Lower Split",
        description: "Simple upper/lower split",
        level: "intermediate",
        isPreMade: 1,
        exerciseNames: ["Bench Press", "Lat Pulldown", "Leg Press"],
        sets: [
          { exerciseName: "Bench Press", weight: 40, reps: 8 },
          { exerciseName: "Lat Pulldown", weight: 60, reps: 10 },
          { exerciseName: "Leg Press", weight: 100, reps: 12 },
        ],
      },
    ];

    /* ---------------- Insert routines ---------------- */

    const createdRoutines = routineDefs.map((r) => ({
      id: uuidv7(),
      name: r.name,
      description: r.description ?? "",
      level: r.level ?? "beginner",
      isPreMade: 1,
    }));

    await db.insert(routines).values(createdRoutines);

    const routineExercisesRows = [];
    const routineSetsRows = [];

    for (let i = 0; i < routineDefs.length; i++) {
      const rd = routineDefs[i];
      const routineId = createdRoutines[i].id;

      const exerciseInputs =
        rd.exerciseIds?.length
          ? rd.exerciseIds
          : rd.exerciseNames ?? [];

      for (const input of exerciseInputs) {
        const found = findExercise(input);
        if (!found) continue;

       routineExercisesRows.push({
  id: uuidv7(),
  routineId,
  exerciseId: found.id,
  unit: "kg" as "kg",
  repsType: "reps" as "reps",
  restTimer: 15,
  notes: "",
});

      }

      for (const s of rd.sets ?? []) {
        const found = findExercise(s.exerciseId ?? s.exerciseName);
        if (!found) continue;
routineSetsRows.push({
  id: uuidv7(),
  routineId,
  exerciseId: found.id,
  weight: s.weight,
  reps: s.reps,
  setType: (s.setType ?? "Normal") as "Normal",
});
      }
    }

    if (routineExercisesRows.length)
      await db.insert(routineExercises).values(routineExercisesRows);

    if (routineSetsRows.length)
      await db.insert(routineSets).values(routineSetsRows);

    console.log("✅ Pre-made routines seeded into PostgreSQL");
    return { skipped: false };
  } catch (err) {
    console.error("❌ Failed to seed pre-made routines:", err);
    throw err;
  }
}
