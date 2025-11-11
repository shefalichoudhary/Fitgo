import React, { useState, useCallback } from "react"
import { View, FlatList, Alert, StyleSheet } from "react-native"
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native"
import { navigate } from "@/navigators/navigationUtilities"
import { InputField } from "@/components/InputField"
import { Button } from "@/components/Button"
import { db } from "@/utils/storage"
import { routines, routineExercises, routineSets } from "@/utils/storage/schema"
import type { HomeStackParamList } from "@/navigators/navigationTypes"
import { ExerciseList } from "@/components/Routines/ExerciseList"
import { EmptyRoutineState } from "@/components/Routines/EmptyRoutineState"
import { useRoutineHelpers } from "@/components/Routines/useRoutineHelpers"

export default function CreateRoutineScreen() {
  const [title, setTitle] = useState("")
  const [exercises, setExercises] = useState<any[]>([])
  const route = useRoute<RouteProp<HomeStackParamList, "CreateRoutine">>()

  const { addSet, toggleRepsType, toggleUnit, updateSetField, updateExercise } =
    useRoutineHelpers(setExercises)

  useFocusEffect(
    useCallback(() => {
      if (route.params?.selectedExercises) {
        const withSets = route.params.selectedExercises.map((ex) => ({
          ...ex,
          sets: (ex.sets || []).map((set, i) => ({
            id: `${Date.now()}-${i}`,
            reps: String(set.reps ?? ""),
            weight: String(set.weight ?? ""),
            repsType: (set as any).repsType ?? "reps",
            unit: (set as any).unit ?? "kg",
          })),
        }))
        setExercises(withSets)
      }
    }, [route.params]),
  )

  // Save routine
  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Please enter a routine title")
    if (exercises.length === 0) return Alert.alert("Add at least one exercise")

    try {
      const [{ id: routineId }] = await db.insert(routines).values({ name: title }).returning()

      for (const ex of exercises) {
        await db
          .insert(routineExercises)
          .values({ routineId, exerciseId: ex.id, unit: "kg", repsType: "reps", restTimer: 0 })

        for (const set of ex.sets) {
          await db.insert(routineSets).values({
            routineId,
            exerciseId: ex.id,
            reps: Number(set.reps) || 0,
            weight: Number(set.weight) || 0,
            minReps: set.repsType === "range" ? Number(set.minReps) || 0 : 0,
            maxReps: set.repsType === "range" ? Number(set.maxReps) || 0 : 0,
            duration: Number(set.duration) || 0,
            setType: set.setType as any,
          })
        }
      }

      Alert.alert("Routine saved!", `Title: ${title}`)
      navigate("Routines")
    } catch (err) {
      console.error("Save failed:", err)
      Alert.alert("Error", "Failed to save routine.")
    }
  }

  const saveDisabled = !title.trim() || exercises.some((ex) => ex.sets.length === 0)

  return (
    <View style={styles.container}>
      <InputField placeholder="Enter routine title" value={title} onChangeText={setTitle} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseList
            exercise={item}
            addSet={addSet}
            toggleUnit={toggleUnit}
            toggleRepsType={toggleRepsType}
            updateSetField={updateSetField}
          />
        )}
        ListEmptyComponent={<EmptyRoutineState />}
        contentContainerStyle={exercises.length === 0 && styles.empty}
      />

      <View style={styles.buttons}>
        <Button
          text="Add Exercise"
          preset="filled"
          onPress={() => navigate("Exercises")}
          style={[styles.btn, { backgroundColor: "#3B82F6" }]}
        />
        <Button
          text="Save Routine"
          preset="filled"
          onPress={handleSave}
          disabled={saveDisabled}
          style={[styles.btn, { backgroundColor: "#10B981", opacity: saveDisabled ? 0.5 : 1 }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030303", padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  buttons: { marginTop: 0 },
  btn: { borderRadius: 8, marginBottom: 12 },
})
