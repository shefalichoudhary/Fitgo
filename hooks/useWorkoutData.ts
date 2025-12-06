import { useEffect, useState } from "react";
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets, exercises,Exercise, RoutineExercise } from "@/utils/storage/schema";
import { eq } from "drizzle-orm";

export type SetLog = {
  id: string;
  reps: number;           // required numeric for downstream code
  weight: number;         // required numeric for downstream code
  minReps?: number | null;
  maxReps?: number | null;
  repsType?: "reps" | "rep range" | string;
  unit?: "kg" | "lbs" | string;
  completed: boolean;
   setType?: string | null;
   duration?: number | null;
};

export type ExerciseLog = {
  id: string;
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
      try {
        const routineRow = await db.select().from(routines).where(eq(routines.id, routineId));
        const routineName = routineRow[0]?.name || "Workout";
        setRoutineTitle(routineName);

        const routineExRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, routineId));

            const exercisesWithSets: ExerciseLog[] = [];

// --- recommended replacement when assembling exercisesWithSets ---
for (const rex of routineExRows) {
  // fetch exercise row
  const exDetails = await db.select().from(exercises).where(eq(exercises.id, rex.exerciseId));
  const exRow = (exDetails[0] ?? {}) as Partial<Exercise>;
  const rexRow = rex as Partial<RoutineExercise>;

  const exName = exRow.exercise_name ?? "Unknown";
  const exType = exRow.exercise_type ?? exRow.type ?? null;
  const equipment = exRow.equipment ?? "";

  const notes = typeof rexRow.notes === "string" ? rexRow.notes : null;
  const unit = (rexRow.unit as any) ?? "kg";
  const repsType = (rexRow.repsType as any) ?? "reps";
  const restTimer = typeof rexRow.restTimer === "number" ? rexRow.restTimer : 0;

  const setsRows = await db
  .select()
  .from(routineSets)
  .where(eq(routineSets.routineId, routineId))

// instance-scoped exercise id
const exInstanceId = `${routineId}`;

exercisesWithSets.push({
  // Use the instance id as the canonical id for UI state (unique per routine instance)
  id: exInstanceId,
  // Keep the original DB exercise id for persistence mapping
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

    return {
  id: s.id,
      reps: typeof s.reps === "number" ? s.reps : 0,
      weight: typeof s.weight === "number" ? s.weight : 0,
      minReps: s.minReps ?? null,
      maxReps: s.maxReps ?? null,
      duration: typeof s.duration === "number" ? s.duration : null,
      repsType: s.repsType ?? (s.reps != null ? "reps" : "rep range"),
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
              s.id === setId ? { ...s, completed: typeof completed === "boolean" ? completed : !s.completed } : s,
            ),
          }
        : ex,
    ),
  );
};
  return { routineTitle, exercisesData, removeExercise, setExercisesData, duration,  toggleSetCompletion: setSetCompletion };
}
