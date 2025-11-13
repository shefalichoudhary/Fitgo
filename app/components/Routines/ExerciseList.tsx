import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SetRow } from "@/components/Routines/SetRow";
import { ExerciseItem } from "./ExerciseItem";

export const ExerciseList = ({ exercise,disablePress, addSet, deleteExercise,toggleUnit,onDelete, toggleRepsType, deleteSet, updateSetField }: any) => {
  return (
    <ExerciseItem name={exercise.name}   disablePress={disablePress}
      onDelete={deleteExercise}  >
     
 {/* Labels row */}
      <View style={styles.labelsRow}>
        <Text style={styles.label}>Reps</Text>
        <Text style={styles.label}>Weight</Text>
        <Text style={styles.label}>Unit</Text>
      </View>
      {/* Sets */}
      {exercise.sets.map((set: any, index: number) => (
        <SetRow
          key={set.id}
          {...set}
          onRepsChange={(t) => updateSetField(exercise.id, set.id, "reps", t)}
          onWeightChange={(t) => updateSetField(exercise.id, set.id, "weight", t)}
          onToggleUnit={() => toggleUnit(exercise.id, set.id)}
          onToggleRepsType={() => toggleRepsType(exercise.id, set.id)}
          onOpenRestTimer={() => {}}
            onDelete={() => deleteSet(exercise.id, set.id)}
        />
      ))}

      {/* Add Set button aligned left and smaller */}
      <Pressable onPress={() => addSet(exercise.id)} style={styles.addSetButton}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>
    </ExerciseItem>
  );
};

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  label: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 12,
    width: 50, // make labels aligned with input width
    textAlign: "center",
  },
  addSetButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1E40AF",
    borderRadius: 8,
  },
  addSetText: { color: "#F9FAFB", fontSize: 14, fontWeight: "600" },
});
