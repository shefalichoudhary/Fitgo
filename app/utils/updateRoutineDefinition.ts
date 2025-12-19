import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets } from "@/utils/storage/schema";
import { eq, and } from "drizzle-orm";

export async function updateRoutineDefinition(
  routineId: string,
  payload: {
    title?: string;
    exercises: any[];
  }
) {
  try {
    // 1. update routine title
    if (payload.title?.trim()) {
      await db
        .update(routines)
        .set({ name: payload.title })
        .where(eq(routines.id, routineId));
    }

    // 2. remove old exercises & sets
    await db.delete(routineExercises).where(eq(routineExercises.routineId, routineId));
    await db.delete(routineSets).where(eq(routineSets.routineId, routineId));

    // 3. insert new exercises & sets
    for (const ex of payload.exercises) {
      await db.insert(routineExercises).values({
        routineId,
   exerciseId: ex.id,
        notes: ex.notes ?? "",
        unit: ex.unit ?? "kg",
        repsType: ex.repsType ?? "reps",
        restTimer: typeof ex.restTimer === "number" ? ex.restTimer : Number(ex.restTimer) || 0,
      });

      for (const set of ex.sets || []) {
        const repsType =
          set.repsType ?? ex.repsType ?? "reps";

        const isRange =
          repsType === "rep range" ||
          repsType === "range" ||
          repsType === "range reps";

        const repsNum = set.reps != null ? Number(set.reps) : 0;
        const weightNum = set.weight != null ? Number(set.weight) : 0;
        const minRepsNum = isRange && set.minReps != null ? Number(set.minReps) : 0;
        const maxRepsNum = isRange && set.maxReps != null ? Number(set.maxReps) : 0;
        const durationNum = set.duration != null ? Number(set.duration) : 0;

        await db.insert(routineSets).values({
          routineId,
          exerciseId: ex.id,
          weight: weightNum,
          reps: repsNum,
          minReps: minRepsNum,
          maxReps: maxRepsNum,
          duration: durationNum,
          setType: set.setType ?? "Normal",
        });
      }
    }

    console.log("Routine updated successfully:", routineId);
    return true;
  } catch (err) {
    console.error("updateRoutineDefinition failed:", err);
    throw err;
  }
}
