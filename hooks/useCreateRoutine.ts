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
  // directly delete without showing another alert
  setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
};


  const saveRoutine = async () => {
    if (!title.trim()) return Alert.alert("Please enter a routine title");
    if (exercises.length === 0) return Alert.alert("Add at least one exercise");

    try {
      const [{ id: routineId }] = await db.insert(routines).values({ name: title }).returning();

      for (const ex of exercises) {
        await db.insert(routineExercises).values({
          routineId,
          exerciseId: ex.id,
          unit: "kg",
          repsType: "reps",
          restTimer: 0,
        });

        for (const set of ex.sets) {
          await db.insert(routineSets).values({
            routineId,
            exerciseId: ex.id,
            reps: Number(set.reps) || 0,
            weight: Number(set.weight) || 0,
            minReps: set.repsType === "range" ? Number(set.minReps) || 0 : 0,
            maxReps: set.repsType === "range" ? Number(set.maxReps) || 0 : 0,
            duration: Number(set.duration) || 0,
            setType: set.setType as any,
          });
        }
      }

      Alert.alert("Routine saved!", `Title: ${title}`);
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
