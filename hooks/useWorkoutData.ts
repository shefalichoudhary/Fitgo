import { useEffect, useState } from "react"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"

export type ExerciseLog = {
  id: string
  name: string
  sets: {
    id: string
    reps: number
    weight: number
    completed: boolean
  }[]
}

export function useWorkoutData(routineId: string) {
  const [routineTitle, setRoutineTitle] = useState("Workout")
  const [exercisesData, setExercisesData] = useState<ExerciseLog[]>([])
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now())
  const [duration, setDuration] = useState(0)

  // Fetch routine and exercises
  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        const routineRow = await db.select().from(routines).where(eq(routines.id, routineId))
        const routineName = routineRow[0]?.name || "Workout"
        setRoutineTitle(routineName)

        const routineExRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, routineId))

        const exercisesWithSets: ExerciseLog[] = []

        for (const rex of routineExRows) {
          const exDetails = await db.select().from(exercises).where(eq(exercises.id, rex.exerciseId))
          const exName = exDetails[0]?.exercise_name || "Unknown"

          const setsRows = await db.select().from(routineSets).where(eq(routineSets.exerciseId, rex.exerciseId))

          exercisesWithSets.push({
            id: rex.exerciseId,
            name: exName,
            sets: setsRows.map((s: any) => ({
              id: s.id,
              reps: s.reps,
              weight: s.weight,
              completed: false,
            })),
          })
        }

        setExercisesData(exercisesWithSets)
        setWorkoutStartTime(Date.now())
      } catch (err) {
        console.error("Failed to fetch workout data:", err)
      }
    }

    fetchRoutineData()
  }, [routineId])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - workoutStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [workoutStartTime])

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setExercisesData((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, completed: !s.completed } : s,
              ),
            }
          : ex,
      ),
    )
  }

  return { routineTitle, exercisesData, setExercisesData, duration, toggleSetCompletion }
}
