import { db } from "./index";
import seedData from "./seedData";
import { exercises, muscles, exerciseMuscles } from "./schema";


export const InsertSeedDataOnce = async () => {
  try {
    // 1️⃣ Fetch all existing exercises and muscles
    const existingExercises = await db.select().from(exercises).all();
    const existingMuscles = await db.select().from(muscles).all();
    const existingLinks = await db.select().from(exerciseMuscles).all();

    // Create maps for quick lookup
    const exerciseMap = new Map(existingExercises.map((ex) => [ex.exercise_name, ex.id]));
    const muscleMap = new Map(existingMuscles.map((m) => [m.name, m.id]));
    const linkSet = new Set(existingLinks.map((l) => `${l.exercise_id}_${l.muscle_id}`));

    for (const exercise of seedData) {
      // 2️⃣ Check/Insert exercise
      let exerciseId = exerciseMap.get(exercise.exercise_name);
      if (!exerciseId) {
        const insertedExercise = await db
          .insert(exercises)
          .values({
            exercise_name: exercise.exercise_name,
            equipment: exercise.equipment,
            type: exercise.type,
            exercise_type: exercise.exercise_type,
          })
          .returning();

        exerciseId = insertedExercise[0].id;
        exerciseMap.set(exercise.exercise_name, exerciseId);
      }

      // 3️⃣ Check/Insert muscles and links
      for (const m of exercise.muscles) {
        let muscleId = muscleMap.get(m.name);
        if (!muscleId) {
          const insertedMuscle = await db
            .insert(muscles)
            .values({ name: m.name })
            .returning();

          muscleId = insertedMuscle[0].id;
          muscleMap.set(m.name, muscleId);
        }

        const linkKey = `${exerciseId}_${muscleId}`;
        if (!linkSet.has(linkKey)) {
          await db.insert(exerciseMuscles).values({
            exercise_id: exerciseId,
            muscle_id: muscleId,
            role: m.role,
          });
          linkSet.add(linkKey);
        }
      }
    }

  } catch (err) {
    console.error("❌ Failed to insert seed data:", err);
  }
};

