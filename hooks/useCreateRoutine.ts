import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets } from "@/utils/storage/schema";

export const useCreateRoutine = (initialExercises: any[] = []) => {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState(initialExercises);

  const deleteSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s: any) => s.id !== setId) }
          : ex
      )
    );
  };

  const deleteExercise = (exerciseId: string) => {
  setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
};


// Replace your saveRoutine with this (matches your schema column names)
const saveRoutine = async () => {
  if (!title.trim()) return Alert.alert("Please enter a routine title");
  if (exercises.length === 0) return Alert.alert("Add at least one exercise");

  try {
    // create routine
    const [{ id: routineId }] = await db.insert(routines).values({ name: title }).returning();

    for (const ex of exercises) {
      // insert exercise-level metadata using camelCase keys (matches your schema)
      await db.insert(routineExercises).values({
        routineId, // matches sqliteTable definition
        exerciseId: ex.id,
        notes: ex.notes ?? "",
        unit: ex.unit ?? "kg",
        repsType: ex.repsType ?? "reps",
        restTimer: typeof ex.restTimer === "number" ? ex.restTimer : Number(ex.restTimer) || 0,
      });

      // insert sets
      for (const set of ex.sets || []) {
        const setRepsType = (set.repsType ?? ex.repsType ?? "reps").toString();
        const isRange =
          setRepsType === "rep range" || setRepsType === "range" || setRepsType === "range reps";

        // Drizzle types expect numbers (your schema uses integer(...).default(0) or .notNull())
        const repsNum = set.reps != null ? Number(set.reps) : 0;
        const weightNum = set.weight != null ? Number(set.weight) : 0; // weight is .notNull() in schema
        const minRepsNum = isRange && set.minReps != null ? Number(set.minReps) : 0;
        const maxRepsNum = isRange && set.maxReps != null ? Number(set.maxReps) : 0;
        const durationNum = set.duration != null ? Number(set.duration) : 0;

        await db.insert(routineSets).values({
          routineId,
          exerciseId: ex.id,
          weight: weightNum,         // integer().notNull() in schema -> must be a number
          reps: repsNum,             // integer().default(0)
          minReps: minRepsNum,       // integer().default(0)
          maxReps: maxRepsNum,       // integer().default(0)
          duration: durationNum,     // integer().default(0)
          setType: (set.setType as any) ?? "Normal", // matches enum in schema
        });
      }
    }

    return true;
  } catch (err) {
    console.error("Save failed:", err);
    Alert.alert("Error", "Failed to save routine.");
    return false;
  }
};



  return {
    title,
    setTitle,
    exercises,
    setExercises,
    deleteSet,
    deleteExercise,
    saveRoutine,
  };
};
