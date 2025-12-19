import { useEffect, useState } from "react";
import { db } from "@/utils/storage";
import {
  routines,
  routineExercises,
  routineSets,
  exercises,
  Exercise,
  RoutineExercise,
} from "@/utils/storage/schema";
import { eq,and } from "drizzle-orm";

export type SetLog = {
  id: string;
  reps: number | null;
  weight: number;
  minReps?: number | null;
  maxReps?: number | null;
  repsType?: "reps" | "rep range" | string;
  unit?: "kg" | "lbs" | string;
  completed: boolean;
  setType?: string | null;
  duration?: number | null;
};

export type ExerciseLog = {
  id: string; // instance id (unique per routine instance)
  exerciseRefId?: string; // original DB exercise id
  name?: string;
  exercise_name?: string;
  exercise_type?: string | null;
  equipment?: string;
  notes?: string | null;
  unit?: "kg" | "lbs" | string;
  repsType?: "reps" | "rep range" | string;
  restTimer?: number;
  sets: SetLog[];
};

export function useWorkoutData(routineId: string) {
  const [routineTitle, setRoutineTitle] = useState("Workout");
  const [exercisesData, setExercisesData] = useState<ExerciseLog[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now());
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) {
        setExercisesData([]);
        return;
      }

      try {
        const routineRow = await db.select().from(routines).where(eq(routines.id, routineId));
        const routineName = routineRow[0]?.name || "Workout";
        setRoutineTitle(routineName);

        const routineExRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, routineId));

        const exercisesWithSets: ExerciseLog[] = [];

        for (const rex of routineExRows) {
          const exDetails = await db
            .select()
            .from(exercises)
            .where(eq(exercises.id, rex.exerciseId));
          const exRow = (exDetails[0] ?? {}) as Partial<Exercise>;
          const rexRow = rex as Partial<RoutineExercise>;

          const exName = exRow.exercise_name ?? "Unknown";
          const exType = exRow.exercise_type ?? exRow.type ?? null;
          const equipment = exRow.equipment ?? "";

          const notes = typeof rexRow.notes === "string" ? rexRow.notes : null;
          const unit = (rexRow.unit as any) ?? "kg";
      const repsType: "reps" | "rep range" =
  rexRow.repsType === "rep range" ? "rep range" : "reps";

          const restTimer = typeof rexRow.restTimer === "number" ? rexRow.restTimer : 0;

          // <-- FIXED: combine predicates with `and(...)`
          const setsRows = await db
            .select()
            .from(routineSets)
            .where(
              and(
                eq(routineSets.routineId, routineId),
                eq(routineSets.exerciseId, rex.exerciseId)
              )
            );

          const exInstanceId = `${routineId}-${rex.exerciseId}`;

          exercisesWithSets.push({
            id: exInstanceId,
            exerciseRefId: rex.exerciseId,
            name: exName,
            exercise_name: exName,
            exercise_type: exType,
            equipment,
            notes,
            unit,
            repsType,
            restTimer,
            sets: (setsRows || []).map((s: any, sIdx: number) => {
              const base = typeof s.id === "string" ? s.id : String(sIdx);
              const namespacedSetId = base.startsWith(`${routineId}-`)
                ? base
                : `${routineId}-${rex.exerciseId}-set-${sIdx}-${base}`;

              return {
                id: namespacedSetId,
       reps: typeof s.reps === "number" ? s.reps : null,
                weight: typeof s.weight === "number" ? s.weight : 0,
                minReps: typeof s.minReps === "number" ? s.minReps : null,
                maxReps: typeof s.maxReps === "number" ? s.maxReps : null,
                duration: typeof s.duration === "number" ? s.duration : null,
               repsType:
  s.repsType === "rep range" || s.repsType === "reps"
    ? s.repsType
    : s.reps != null
    ? "reps"
    : "rep range",
                unit: s.unit ?? unit,
                completed: false,
                setType: s.setType ?? "Normal",
              } as SetLog;
            }),
          } as ExerciseLog);
        }

        setExercisesData(exercisesWithSets);
        setWorkoutStartTime(Date.now());
      } catch (err) {
        console.error("Failed to fetch workout data:", err);
      }
    };

    fetchRoutineData();
  }, [routineId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  const removeExercise = (exerciseId: string) => {
    setExercisesData((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  // new signature: if `completed` is provided, set to that value, otherwise toggle
  const setSetCompletion = (exerciseId: string, setId: string, completed?: boolean) => {
    setExercisesData((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, completed: typeof completed === "boolean" ? completed : !s.completed } : s
              ),
            }
          : ex
      )
    );
  };

  return {
    routineTitle,
    exercisesData,
    removeExercise,
    setExercisesData,
    duration,
    toggleSetCompletion: setSetCompletion,
  };
}
