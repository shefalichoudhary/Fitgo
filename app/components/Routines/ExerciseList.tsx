import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { SetRow } from "@/components/Routines/SetRow"
import { ExerciseItem } from "./ExerciseItem"

export const ExerciseList = ({ exercise, addSet, toggleUnit, toggleRepsType, updateSetField }:any) => {
  return (
    <ExerciseItem name={exercise.name}>
      {exercise.sets.map((set:any) => (
        <SetRow
          key={set.id}
          {...set}
          onRepsChange={(t) => updateSetField(exercise.id, set.id, "reps", t)}
          onWeightChange={(t) => updateSetField(exercise.id, set.id, "weight", t)}
          onToggleUnit={() => toggleUnit(exercise.id, set.id)}
          onToggleRepsType={() => toggleRepsType(exercise.id, set.id)}
          onOpenRestTimer={() => {}}
        />
      ))}
      <Pressable onPress={() => addSet(exercise.id)} style={styles.addSetButton}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>
    </ExerciseItem>
  )
}

const styles = StyleSheet.create({
  addSetButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
  },
  addSetText: { color: "#F9FAFB", fontSize: 14, fontWeight: "600" },
})
