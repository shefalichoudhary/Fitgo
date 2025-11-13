import { useEffect, useState } from "react"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets } from "@/utils/storage/schema"
import { eq, and } from "drizzle-orm"

export type RoutineWithExercises = {
  id: string
  title: string
  exercises: { id: string; sets: number }[]
}

export const useRoutines = () => {
  const [routinesData, setRoutinesData] = useState<RoutineWithExercises[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const routinesRows = await db.select().from(routines).where(eq(routines.isPreMade, 0))
        const routinesWithExercises: RoutineWithExercises[] = []

        for (const routine of routinesRows) {
          const exercisesRows = await db
            .select()
            .from(routineExercises)
            .where(eq(routineExercises.routineId, routine.id))

          const exercisesWithSets = await Promise.all(
            exercisesRows.map(async (ex) => {
              const setsRows = await db
                .select()
                .from(routineSets)
                .where(and(eq(routineSets.exerciseId, ex.exerciseId), eq(routineSets.routineId, routine.id)))
              return { id: ex.exerciseId, sets: setsRows.length }
            }),
          )

          routinesWithExercises.push({
            id: routine.id,
            title: routine.name,
            exercises: exercisesWithSets,
          })
        }

        setRoutinesData(routinesWithExercises)
      } catch (err) {
        console.error("Failed to fetch routines:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoutines()
  }, [])

  return { routinesData, setRoutinesData, loading }
}
