import { db } from "@/utils/storage"
import { workouts, workoutExercises, workoutSets, userRoutineWorkout } from "@/utils/storage/schema"
import cuid from "cuid"

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
  userId: string
  routineId: string
  routineName: string
  totalSets: number
  completedSets: number
  totalVolume: number
  duration: number
  exercises: {
    id: string
    sets: { id: string; reps: number; weight: number; completed: boolean }[]
  }[]
}) {
  try {
    const workoutId = cuid()
    const date = new Date().toISOString()

    // 1️⃣ Insert workout
    await db.insert(workouts).values({
      id: workoutId,
      routineId,
      date,
      title: routineName,
      duration,
      volume: totalVolume,
      sets: completedSets,
    })

    // 2️⃣ Insert exercises and sets
    for (const exercise of exercises) {
      const workoutExerciseId = cuid()

      await db.insert(workoutExercises).values({
        id: workoutExerciseId,
        workoutId,
        exerciseId: exercise.id,
      })

      for (const set of exercise.sets.filter((s) => s.completed)) {
        await db.insert(workoutSets).values({
          id: cuid(),
          workoutId,
          exerciseId: exercise.id,
          weight: set.weight,
          reps: set.reps,
          setType: "Normal",
        })
      }
    }

    // 3️⃣ Link user and workout
    await db.insert(userRoutineWorkout).values({
      userId,
      routineId,
      workoutId,
    })

    console.log("✅ Workout saved successfully:", workoutId)
    return workoutId
  } catch (error) {
    console.error("❌ Failed to save workout:", error)
  }
}
