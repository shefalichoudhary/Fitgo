import React, { useState } from "react"
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from "react-native"
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import { navigate } from "@/navigators/navigationUtilities"
import type { HomeStackParamList } from "@/navigators/navigationTypes"
import { SetRow } from "@/components/Routines/SetRow"
import { useRoutine } from "@/context/RoutineContext"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets } from "@/utils/storage/schema"

type SetItem = {
  id: string
  reps: string
  weight: string
  repsType: "reps" | "range"
  unit: "kg" | "lbs"
  minReps?: string
  maxReps?: string
  duration?: string
  setType?: string
}

type Exercise = {
  id: string
  name: string
  sets: SetItem[]
}

export default function CreateRoutineScreen() {
  const [title, setTitle] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const route = useRoute<RouteProp<HomeStackParamList, "CreateRoutine">>()
  const { addRoutine } = useRoutine()

  useFocusEffect(
    useCallback(() => {
      if (route.params?.selectedExercises) {
        const withSets = route.params.selectedExercises.map((ex) => ({
          ...ex,
          sets: ex.sets
            ? ex.sets.map((set, index) => ({
                id: `${Date.now()}-${index}`,
                reps: String(set.reps ?? ""),
                weight: String(set.weight ?? ""),
                repsType: (set as any).repsType ?? "reps",
                unit: (set as any).unit ?? "kg",
              }))
            : [],
        }))
        setExercises(withSets)
      }
    }, [route.params]),
  )

  const toggleUnit = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, unit: set.unit === "kg" ? "lbs" : "kg" } : set,
              ),
            }
          : ex,
      ),
    )
  }

  const toggleRepsType = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId
                  ? { ...set, repsType: set.repsType === "reps" ? "range" : "reps" }
                  : set,
              ),
            }
          : ex,
      ),
    )
  }

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: Date.now().toString(),
                  reps: "",
                  weight: "",
                  repsType: "reps",
                  unit: "kg",
                },
              ],
            }
          : ex,
      ),
    )
  }

  const updateSetField = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : ex,
      ),
    )
  }

  const openRestTimerModal = (setId: string) => {
    Alert.alert("Rest Timer", `Open timer for set ${setId}`)
  }
  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Please enter a routine title")
    if (exercises.length === 0) return Alert.alert("Add at least one exercise")

    try {
      // 1️⃣ Insert routine
      const insertedRoutine = await db.insert(routines).values({ name: title }).returning()
      const routineId = insertedRoutine[0].id

      for (const exercise of exercises) {
        // 2️⃣ Insert routineExercise
        const insertedRoutineExercise = await db
          .insert(routineExercises)
          .values({
            routineId: routineId,
            exerciseId: exercise.id,
            unit: "kg",
            repsType: "reps",
            restTimer: 0,
          })
          .returning()

        // 3️⃣ Insert sets
        for (const set of exercise.sets) {
          await db.insert(routineSets).values({
            routineId: routineId,
            exerciseId: exercise.id,
            reps: Number(set.reps) || 0,
            weight: set.weight ? Number(set.weight) : 0,
            minReps: set.repsType === "range" ? Number(set.minReps) || 0 : 0,
            maxReps: set.repsType === "range" ? Number(set.maxReps) || 0 : 0,
            duration: set.duration ? Number(set.duration) : 0,
            setType: set.setType as "W" | "Normal" | "D" | "F",
          })
        }
      }

      Alert.alert("Routine saved!", `Title: ${title}`)
      navigate("Routines")
    } catch (err) {
      console.error("Failed to save routine:", err)
      Alert.alert("Error", "Failed to save routine.")
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Routine Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor="#A0AEC0"
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseText}>{item.name}</Text>

            {item.sets.map((set, index) => (
              <SetRow
                key={set.id}
                reps={set.reps}
                weight={set.weight}
                repsType={set.repsType}
                unit={set.unit}
                onRepsChange={(text) => updateSetField(item.id, set.id, "reps", text)}
                onWeightChange={(text) => updateSetField(item.id, set.id, "weight", text)}
                onToggleUnit={() => toggleUnit(item.id, set.id)}
                onToggleRepsType={() => toggleRepsType(item.id, set.id)}
                onOpenRestTimer={() => openRestTimerModal(set.id)}
              />
            ))}

            <Pressable onPress={() => addSet(item.id)} style={styles.addSetButton}>
              <Text style={styles.addSetText}>+ Add Set</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No exercises added yet</Text>}
        contentContainerStyle={exercises.length === 0 && styles.emptyContent}
      />

      <View style={styles.buttonGroup}>
        <Pressable style={styles.button} onPress={() => navigate("Exercises")}>
          <Text style={styles.buttonText}>Add Exercise</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            (!title.trim() || exercises.some((ex) => ex.sets.length === 0)) && styles.disabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim() || exercises.some((ex) => ex.sets.length === 0)}
        >
          <Text style={styles.buttonText}>Save Routine</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030303",
    padding: 16,
  },
  input: {
    backgroundColor: "#1b1b1b",
    padding: 14,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  list: {
    flex: 1,
    marginBottom: 12,
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  exerciseItem: {
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  addSetButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
  },
  addSetText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonGroup: {
    marginTop: 0,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
})
