import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native"
import { Screen } from "@/components/Screen"
import { Ionicons } from "@expo/vector-icons"
import { useRoute, RouteProp } from "@react-navigation/native"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema"
import { eq, and } from "drizzle-orm"
import AntDesign from "@expo/vector-icons/AntDesign"
type RootStackParamList = {
  RoutineDetails: { id: string }
}

type RoutineWithExercises = {
  id: string
  title: string
  exercises: {
    id: string
    name: string
    sets: {
      id: string
      reps: number
      weight: number
      unit: "lbs" | "kg"
      repsType: "reps" | "rep range"
    }[]
  }[]
}

export default function RoutineDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RoutineDetails">>()
  const { id } = route.params
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [titleEditing, setTitleEditing] = useState(false)
  const [title, setTitle] = useState("")

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const [routineRow] = await db.select().from(routines).where(eq(routines.id, id))
        if (!routineRow) {
          setRoutine(null)
          setLoading(false)
          return
        }

        const exercisesRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, id))

        const exercisesWithSets = await Promise.all(
          exercisesRows.map(async (ex) => {
            const [exerciseRow] = await db
              .select()
              .from(exercises)
              .where(eq(exercises.id, ex.exerciseId))

            const setsRows = await db
              .select()
              .from(routineSets)
              .where(and(eq(routineSets.routineId, id), eq(routineSets.exerciseId, ex.exerciseId)))

            return {
              id: ex.exerciseId,
              name: exerciseRow?.exercise_name || "Unnamed Exercise",
              sets: setsRows.map((s) => ({
                id: s.id,
                reps: s.reps ?? 0,
                weight: s.weight,
                unit: "kg" as "lbs" | "kg",
                repsType: "reps" as "reps" | "rep range",
              })),
            }
          }),
        )

        setRoutine({
          id: routineRow.id,
          title: routineRow.name,
          exercises: exercisesWithSets,
        })
        setTitle(routineRow.name)
      } catch (err) {
        console.error("Failed to fetch routine:", err)
        setRoutine(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRoutine()
  }, [id])

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </Screen>
    )
  }
  const saveTitle = () => {
    if (!routine) return
    if (title === routine.title) {
      setTitleEditing(false)
      return
    }
    setShowConfirmModal(true)
  }

  const confirmUpdate = async () => {
    if (!routine) return
    try {
      await db.update(routines).set({ name: title }).where(eq(routines.id, routine.id))
      setRoutine({ ...routine, title })
    } catch (err) {
      console.error("Failed to update title:", err)
    } finally {
      setShowConfirmModal(false)
      setTitleEditing(false)
    }
  }

  const cancelUpdate = () => {
    setTitle(routine?.title || "")
    setShowConfirmModal(false)
    setTitleEditing(false)
  }

  if (!routine) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#777" />
        <Text style={styles.errorText}>Routine not found</Text>
      </Screen>
    )
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Routine Header */}
      <View style={styles.header}>
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          {titleEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              onBlur={saveTitle}
              onSubmitEditing={saveTitle}
              autoFocus
            />
          ) : (
            <Text style={styles.title}>{routine.title}</Text>
          )}

          {/* Edit Button */}
          {!titleEditing && (
            <TouchableOpacity onPress={() => setTitleEditing(true)}>
              <AntDesign name="edit" size={24} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {routine.exercises.length} {routine.exercises.length === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Exercises List */}
      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <View style={styles.setBadge}>
                <Text style={styles.setBadgeText}>
                  {item.sets.length} {item.sets.length === 1 ? "set" : "sets"}
                </Text>
              </View>
            </View>
            {item.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setText}>
                  Set {index + 1}: {set.repsType === "rep range" ? `${set.reps} reps` : set.reps} •
                  Volume: {set.weight} {set.unit}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Update</Text>
            <Text style={styles.modalMessage}>Do you want to update the routine title?</Text>

          <View style={styles.modalButtons}>
  <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={cancelUpdate}>
    <Text style={styles.modalButtonText}>Cancel</Text>
  </TouchableOpacity>
  <TouchableOpacity style={[styles.modalButton, styles.modalButtonUpdate]} onPress={confirmUpdate}>
    <Text style={styles.modalButtonText}>Update</Text>
  </TouchableOpacity>
</View>
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  titleInput: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#2563EB",
    paddingVertical: 2,
    flex: 1,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  exerciseCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  setBadge: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  setBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  setRow: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  setText: {
    color: "#E5E5E5",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 12,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
},
modalButtonCancel: {
  marginRight: 10,
  backgroundColor: "#777",
},
modalButtonUpdate: {
  backgroundColor: "#2563EB",
},
})
