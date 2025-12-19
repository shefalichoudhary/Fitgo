import { db } from "@/utils/storage";
import { workouts, workoutExercises, workoutSets, userRoutineWorkout } from "@/utils/storage/schema";
import cuid from "cuid";
import type { ExerciseLog } from "../../hooks/useWorkoutData";

// allowed setType values from schema
const ALLOWED_SET_TYPES = ["W", "Normal", "D", "F"] as const;
type SetType = (typeof ALLOWED_SET_TYPES)[number];

function safeSetType(v: unknown): SetType {
  if (typeof v === "string" && (ALLOWED_SET_TYPES as readonly string[]).includes(v)) {
    return v as SetType;
  }
  return "Normal";
}

// allowed repsType values
const ALLOWED_REPS_TYPE = ["reps", "rep range"] as const;
type RepsType = (typeof ALLOWED_REPS_TYPE)[number];

function safeRepsType(v: unknown): RepsType {
  if (typeof v === "string" && (ALLOWED_REPS_TYPE as readonly string[]).includes(v)) {
    return v as RepsType;
  }
  return "reps";
}

// allowed unit values
const ALLOWED_UNITS = ["kg", "lbs"] as const;
type UnitType = (typeof ALLOWED_UNITS)[number];

function safeUnit(v: unknown): UnitType {
  if (typeof v === "string" && (ALLOWED_UNITS as readonly string[]).includes(v)) {
    return v as UnitType;
  }
  return "kg";
}

export async function saveWorkoutSession({
  userId,
  routineId,
  routineName,
  totalSets,
  completedSets,
  totalVolume,
  duration,
  exercises,
}: {
  userId: string;
  routineId: string;
  routineName: string;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  duration: number;
  exercises: ExerciseLog[];
}) {
  try {
    const workoutId = cuid();
    const date = new Date().toISOString();

    await db.insert(workouts).values({
      id: workoutId,
      routineId,
      date,
      title: routineName,
      duration,
      volume: totalVolume,
      sets: completedSets,
    });

    for (const exercise of exercises) {
      const workoutExerciseId = cuid();
      await db.insert(workoutExercises).values({
        id: workoutExerciseId,
        workoutId,
        exerciseId: exercise.id,
        restTimer: typeof exercise.restTimer === "number" ? exercise.restTimer : 0,
        notes: exercise.notes ?? "",
        unit: safeUnit(exercise.unit ?? undefined),
        repsType: safeRepsType(exercise.repsType ?? undefined),
      });

      for (const set of (exercise.sets || []).filter((s) => s.completed)) {
        await db.insert(workoutSets).values({
          id: cuid(),
          workoutId,
          exerciseId: exercise.id,
          weight: set.weight ?? 0,
          reps: set.reps ?? 0,
          minReps: typeof set.minReps === "number" ? set.minReps : null,
          maxReps: typeof set.maxReps === "number" ? set.maxReps : null,
          setType: safeSetType(set.setType),
          duration: set.duration ?? 0,
        });
      }
    }

    await db.insert(userRoutineWorkout).values({
      userId,
      routineId,
      workoutId,
    });

    console.log("✅ Workout saved successfully:", workoutId);
    return workoutId;
  } catch (error) {
    console.error("❌ Failed to save workout:", error);
    throw error;
  }
}
