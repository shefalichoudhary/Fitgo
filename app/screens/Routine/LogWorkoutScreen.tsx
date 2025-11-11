import React, { useEffect, useState, useRef } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native"
import { Screen } from "@/components/Screen"
import { useRoute } from "@react-navigation/native"
import { db } from "@/utils/storage"
import { routineExercises, routineSets, exercises } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"

type ExerciseLog = {
  id: string
  name: string
  sets: {
    id: string
    reps: number
    weight: number
    completed: boolean
  }[]
}

export default function LogWorkoutScreen() {
  const route = useRoute<any>()
  const { routineId } = route.params

  const [routineTitle, setRoutineTitle] = useState("")
  const [exercisesData, setExercisesData] = useState<ExerciseLog[]>([])
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now())

  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        // Get routine exercises
        const routineExRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, routineId))

        const exercisesWithSets: ExerciseLog[] = []

        for (const rex of routineExRows) {
          // Get exercise details
          const exDetails = await db
            .select()
            .from(exercises)
            .where(eq(exercises.id, rex.exerciseId))
          const exName = exDetails[0]?.exercise_name || "Unknown"

          // Get sets
          const setsRows = await db
            .select()
            .from(routineSets)
            .where(eq(routineSets.exerciseId, rex.exerciseId))

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
        setRoutineTitle("Workout") // you can fetch routine name if needed
      } catch (err) {
        console.error("Failed to fetch workout data:", err)
      }
    }

    fetchRoutineData()
    setWorkoutStartTime(Date.now())
  }, [routineId])

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setExercisesData((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
            }
          : ex,
      ),
    )
  }

  const totalSets = exercisesData.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = exercisesData.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  )
  const totalVolume = exercisesData.reduce(
    (acc, ex) => acc + ex.sets.reduce((v, s) => v + (s.completed ? s.reps * s.weight : 0), 0),
    0,
  )
  const duration = Math.floor((Date.now() - workoutStartTime) / 1000) // in seconds

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>{routineTitle}</Text>

      <View style={styles.summary}>
        {/* Labels Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sets</Text>
          <Text style={styles.summaryLabel}>Volume</Text>
          <Text style={styles.summaryLabel}>Duration</Text>
        </View>

        {/* Values Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>
            {completedSets}/{totalSets}
          </Text>
          <Text style={styles.summaryValue}>{totalVolume} kg</Text>
          <Text style={styles.summaryValue}>
            {Math.floor(duration / 60)}:{("0" + (duration % 60)).slice(-2)} min
          </Text>
        </View>
      </View>
      <FlatList
        data={exercisesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{item.name}</Text>
            {item.sets.map((set, idx) => (
              <TouchableOpacity
                key={set.id}
                style={[styles.setRow, set.completed && styles.completedSet]}
                onPress={() => toggleSetCompletion(item.id, set.id)}
              >
                <Text style={styles.setText}>
                  Set {idx + 1}: {set.reps} reps × {set.weight} kg
                </Text>
                <Text style={styles.setText}>{set.completed ? "✔️" : "❌"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#121212" },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16 , marginLeft:10},
  summary: { marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-evenly", marginBottom: 4 },
  summaryLabel: { color: "#aaa", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "center" },
  summaryValue: { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },

  exerciseCard: { marginBottom: 16, padding: 12, backgroundColor: "#1E1E1E", borderRadius: 10 },
  exerciseTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2A2A2A",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  completedSet: { backgroundColor: "#2563EB" },
  setText: { color: "#fff", fontWeight: "500" },
})
