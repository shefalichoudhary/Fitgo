import { db } from "./index";
import seedData from "../seed/seedData";
import {
  exercises,
  muscles,
  exerciseMuscles,
} from "../schema.pg";

import type {
  Exercise,
  Muscle,
  ExerciseMuscle,
} from "../schema.pg";

export async function InsertSeedDataOnce() {
  // 0️⃣ Guard: run only once
  const existing = await db.select().from(exercises).limit(1);
  if (existing.length > 0) {
    console.log("✔️ Seed already exists");
    return;
  }

  try {
    // 1️⃣ Fetch existing rows (NO .all())
    const existingExercises = await db.select().from(exercises);
    const existingMuscles = await db.select().from(muscles);
    const existingLinks = await db.select().from(exerciseMuscles);

    // 2️⃣ Lookup maps
    const exerciseMap = new Map(
      existingExercises.map((ex: Exercise) => [ex.exercise_name, ex.id])
    );

    const muscleMap = new Map(
      existingMuscles.map((m: Muscle) => [m.name, m.id])
    );

    const linkSet = new Set(
      existingLinks.map(
        (l: ExerciseMuscle) => `${l.exercise_id}_${l.muscle_id}`
      )
    );

    // 3️⃣ Insert seed data
    for (const exercise of seedData) {
      let exerciseId = exerciseMap.get(exercise.exercise_name);

      if (!exerciseId) {
        const [inserted] = await db
          .insert(exercises)
          .values({
            exercise_name: exercise.exercise_name,
            equipment: exercise.equipment,
            type: exercise.type,
            exercise_type: exercise.exercise_type,
          })
          .returning();

        exerciseId = inserted.id;
        exerciseMap.set(exercise.exercise_name, exerciseId);
      }

      for (const m of exercise.muscles) {
        let muscleId = muscleMap.get(m.name);

        if (!muscleId) {
          const [insertedMuscle] = await db
            .insert(muscles)
            .values({ name: m.name })
            .returning();

          muscleId = insertedMuscle.id;
          muscleMap.set(m.name, muscleId);
        }

        const linkKey = `${exerciseId}_${muscleId}`;

        if (!linkSet.has(linkKey)) {
          await db.insert(exerciseMuscles).values([
            {
              exercise_id: exerciseId,
              muscle_id: muscleId,
              role: m.role,
            },
          ]);

          linkSet.add(linkKey);
        }
      }
    }

    console.log("✅ Seed data inserted successfully");
  } catch (err) {
    console.error("❌ Failed to insert seed data:", err);
  }
}
