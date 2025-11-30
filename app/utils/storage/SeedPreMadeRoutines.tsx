// utils/seedPreMadeRoutines.ts
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema";
import cuid from "cuid";
import { eq } from "drizzle-orm";
import { InsertSeedDataOnce } from "@/utils/storage/insertSeedData"; // adjust path if needed

type SetDef = { exerciseName?: string; exerciseId?: string; weight: number; reps: number; setType?: string };
type RoutineDef = {
  name: string;
  description?: string;
  level?: string;
  isPreMade?: number;
  // Accept either names or ids (or both). If both present, id wins.
  exerciseNames?: string[];
  exerciseIds?: string[];
  sets?: SetDef[];
};

export async function seedPreMadeRoutines() {
  try {
    // 1) ensure base seed (exercises + muscles) exist
    await InsertSeedDataOnce();

    // 2) skip if already seeded
    const existingPreMade = await db.select().from(routines).where(eq(routines.isPreMade, 1)).all();
    if (existingPreMade.length > 0) {
      console.log("✅ Pre-made routines already exist — skipping.");
      return { skipped: true };
    }

    // 3) read all exercises into maps (by id and by lowercase name)
    const allExercises = await db.select().from(exercises).all();
    const idToRow: Record<string, { id: string; exercise_name: string }> = {};
    const nameToRow: Record<string, { id: string; exercise_name: string }> = {};

    for (const ex of allExercises) {
      idToRow[ex.id] = { id: ex.id, exercise_name: ex.exercise_name };
      nameToRow[ex.exercise_name.toLowerCase()] = { id: ex.id, exercise_name: ex.exercise_name };
    }

    // helper: find an exercise by id or name (with fallbacks)
    const findExercise = (input?: string | null) => {
      if (!input) return null;

      // 1) exact id match
      if (idToRow[input]) return idToRow[input];

      // 2) exact name case-insensitive
      const lower = input.toLowerCase();
      if (nameToRow[lower]) return nameToRow[lower];

      // 3) case-insensitive exact search across allExercises (defensive)
      const ciExact = allExercises.find((e) => e.exercise_name.toLowerCase() === lower);
      if (ciExact) return { id: ciExact.id, exercise_name: ciExact.exercise_name };

      // 4) substring match (contains)
      const substring = allExercises.find(
        (e) =>
          e.exercise_name.toLowerCase().includes(lower) ||
          lower.includes(e.exercise_name.toLowerCase())
      );
      if (substring) return { id: substring.id, exercise_name: substring.exercise_name };

      // not found
      return null;
    };

    // 4) define your routines (use desired names or ids)
    const routineDefs: RoutineDef[] = [
      {
        name: "Full Body Beginner",
        description: "A balanced full-body routine for beginners, 3 times a week.",
        level: "beginner",
        isPreMade: 1,
        // either provide names...
        exerciseNames: ["Barbell Squat", "Bench Press", "Deadlift"],
        sets: [
          { exerciseName: "Barbell Squat", weight: 50, reps: 10, setType: "Normal" },
          { exerciseName: "Barbell Squat", weight: 55, reps: 8, setType: "Normal" },
          { exerciseName: "Bench Press", weight: 40, reps: 10, setType: "Normal" },
          { exerciseName: "Deadlift", weight: 70, reps: 5, setType: "Normal" },
        ],
      },
      {
        name: "Upper / Lower Split",
        description: "A simple upper/lower split for building strength and size.",
        level: "intermediate",
        isPreMade: 1,
        exerciseNames: ["Bench Press", "Lat Pulldown",  "Leg Press"],
        sets: [
          { exerciseName: "Bench Press", weight: 40, reps: 8, setType: "Normal" },
          { exerciseName: "Lat Pulldown", weight: 60, reps: 10, setType: "Normal" },
          { exerciseName: "Leg Press", weight: 100, reps: 12, setType: "Normal" },
          { exerciseName: "Leg Press", weight: 120, reps: 15, setType: "Normal" },

        ],
      },
    ];

    // 5) insert routines and collect a report of used exercises
    const report: Record<string, Array<{ name: string; id: string }>> = {};

    // create routine rows
    const createdRoutines = routineDefs.map((rd) => ({
      id: cuid(),
      name: rd.name,
      description: rd.description ?? "",
      level: rd.level ?? "beginner",
      isPreMade: rd.isPreMade ?? 1,
    }));
    await db.insert(routines).values(createdRoutines);

    // insert routineExercises and routineSets using actual exercise ids found from seeded exercises
    const routineExercisesInserts: any[] = [];
    const routineSetsInserts: any[] = [];

    for (let i = 0; i < routineDefs.length; i++) {
      const rd = routineDefs[i];
      const routineId = createdRoutines[i].id;
      report[rd.name] = [];

      // Build desired list where ids take precedence over names
      const desiredList: string[] = [];
      if (rd.exerciseIds && rd.exerciseIds.length > 0) {
        // push ids as-is (we'll resolve them via findExercise which handles id lookup)
        desiredList.push(...rd.exerciseIds);
      } else if (rd.exerciseNames && rd.exerciseNames.length > 0) {
        desiredList.push(...rd.exerciseNames);
      }

      // map each desired item to an existing seeded exercise
      for (const desired of desiredList) {
        const found = findExercise(desired);
        if (!found) {
          console.warn(`⚠️ Exercise not found for "${desired}" when seeding routine "${rd.name}". Skipping.`);
          continue;
        }
        // add to report
        report[rd.name].push({ name: found.exercise_name, id: found.id });

        routineExercisesInserts.push({
          id: cuid(),
          routineId,
          exerciseId: found.id,
          unit: "kg" as const,
          repsType: "reps" as const,
          restTimer: 90,
          notes: "",
        });
      }

      // handle sets (if provided)
      if (rd.sets && rd.sets.length > 0) {
        for (const s of rd.sets) {
          // Prefer an explicit exerciseId on the set, then exerciseName on the set, then fall back to the routine-level match
          const setLookupKey = s.exerciseId ?? s.exerciseName;
          const found = findExercise(setLookupKey);
          if (!found) {
            console.warn(`⚠️ Set exercise not found for "${setLookupKey}" in routine "${rd.name}". Skipping set.`);
            continue;
          }
          routineSetsInserts.push({
            id: cuid(),
            routineId,
            exerciseId: found.id,
            weight: s.weight,
            reps: s.reps,
            setType: (s.setType ?? "Normal") as any,
          });
        }
      }
    }

    // commit routineExercises and sets
    if (routineExercisesInserts.length > 0) await db.insert(routineExercises).values(routineExercisesInserts);
    if (routineSetsInserts.length > 0) await db.insert(routineSets).values(routineSetsInserts);

    console.log("✅ Pre-made routines seeded successfully! Report:", report);
    return { skipped: false, report };
  } catch (err) {
    console.error("❌ Failed to seed pre-made routines:", err);
    throw err;
  }
}
