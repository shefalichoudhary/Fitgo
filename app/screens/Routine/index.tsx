import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Screen } from "@/components/Screen"
import DraggableFlatList from "react-native-draggable-flatlist"
import { RoutineCard } from "./../../components/Routines/RoutineCard"
import { useRoutines, RoutineWithExercises } from "../../../hooks/useRoutines"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets } from "@/utils/storage/schema"
import { sql } from "drizzle-orm"
import cuid from "cuid";

export default function RoutineScreen() {
  const { routinesData, setRoutinesData, loading } = useRoutines()
  const handleDelete = async (id: string) => {
    try {
      await db.delete(routineSets).where(sql`${routineSets.routineId} = ${id}`)
      await db.delete(routineExercises).where(sql`${routineExercises.routineId} = ${id}`)
      await db.delete(routines).where(sql`${routines.id} = ${id}`)
      setRoutinesData(routinesData.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Failed to delete routine:", error)
    }
  }


const handleDuplicate = async (routine: RoutineWithExercises) => {
  try {
    const newRoutineId = cuid();

    // Insert routine in DB
    await db.insert(routines).values({
      id: newRoutineId,
      name: routine.title + " (Copy)", 
      createdBy: null,
      isPreMade: 0,
      level: "beginner",
      description: "",
    });

    for (const ex of routine.exercises) {
      const newExId = cuid();

      await db.insert(routineExercises).values({
        id: newExId,
        routineId: newRoutineId,
        exerciseId: ex.id, // map ex.id to exerciseId
        notes: "",          // default
        unit: "kg",         // default
        repsType: "reps",   // default
        restTimer: 0,
      });

      // Make sure ex.sets is an array, not a number
      if (Array.isArray(ex.sets)) {
        for (const set of ex.sets) {
          await db.insert(routineSets).values({
            id: cuid(),
            routineId: newRoutineId,
            exerciseId: newExId,
            weight: set.weight ?? 0,
            reps: set.reps ?? 0,
            minReps: set.minReps ?? 0,
            maxReps: set.maxReps ?? 0,
            duration: set.duration ?? 0,
            setType: set.setType ?? "Normal",
          });
        }
      }
    }

    // Update local state
    setRoutinesData([
      {
        ...routine,
        id: newRoutineId,
        title: routine.title + " (Copy)",
      },
      ...routinesData,
    ]);
  } catch (error) {
    console.error("Failed to duplicate routine:", error);
  }
};


  if (loading) {
    return (
      <Screen contentContainerStyle={styles.center}>
        <Text style={{ color: "#121212" }}>Loading routines...</Text>
      </Screen>
    )
  }

  if (!routinesData.length) {
    return (
      <Screen contentContainerStyle={styles.center}>
        <Text style={{ color: "#121212" }}>No routines yet 💪</Text>
      </Screen>
    )
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      <DraggableFlatList
        data={routinesData}
        keyExtractor={(item) => item.id}
        renderItem={(params) => (
          <RoutineCard {...params} onDelete={handleDelete} onDuplicate={handleDuplicate} />
        )}
        onDragEnd={({ data }) => setRoutinesData(data)}
        activationDistance={10}
        animationConfig={{ damping: 20, mass: 0.8, stiffness: 120 }}
        contentContainerStyle={styles.listContainer}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingVertical: 10, backgroundColor: "#121212" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
})
