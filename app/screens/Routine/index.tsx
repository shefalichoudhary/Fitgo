import React, { useEffect, useState } from "react"
import { StyleSheet, Text, Pressable, View, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets } from "@/utils/storage/schema"
import { eq, and } from "drizzle-orm"

type RoutineWithExercises = {
  id: string
  title: string
  exercises: {
    id: string
    sets: number
  }[]
}

type RootStackParamList = {
  RoutineDetails: { id: string }
}

export default function RoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [routinesData, setRoutinesData] = useState<RoutineWithExercises[]>([])

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const routinesRows = await db.select().from(routines)

        const routinesWithExercises: RoutineWithExercises[] = []

        for (const routine of routinesRows) {
          // Get exercises for this routine
          const exercisesRows = await db
            .select()
            .from(routineExercises)
            .where(eq(routineExercises.routineId, routine.id)) // ✅ eq helper

          const exercisesWithSets = await Promise.all(
            exercisesRows.map(async (ex) => {
              // Count sets for each exercise
              const setsRows = await db
                .select()
                .from(routineSets)
                .where(
                  and(
                    eq(routineSets.exerciseId, ex.exerciseId),
                    eq(routineSets.routineId, routine.id),
                  ),
                ) // ✅ combine conditions with and()

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
      }
    }

    fetchRoutines()
  }, [])

  return (
    <Screen contentContainerStyle={styles.container}>
      {routinesData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={72} color="#555" />
          <Text style={styles.emptyTitle}>No Routines Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first workout routine and start tracking your progress.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routinesData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.routineCard}
              onPress={() => navigation.navigate("RoutineDetails", { id: item.id })}
            >
              <View>
                <Text style={styles.routineText}>{item.title}</Text>
                <Text style={styles.routineSubText}>{item.exercises.length} exercises</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </Pressable>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingVertical: 10, backgroundColor: "#121212" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  routineCard: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routineText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  routineSubText: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 100,
  },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16 },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
})
