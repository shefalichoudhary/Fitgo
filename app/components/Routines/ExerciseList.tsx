import React from "react"
import { View, Text, TextInput, Pressable, TouchableOpacity, StyleSheet } from "react-native"
import  SetRow from "@/components/Routines/SetRow"
import { ExerciseItem } from "./ExerciseItem"
import { Ionicons } from "@expo/vector-icons"

export const ExerciseList = ({
  exercise,
  disablePress,
  addSet,
  deleteExercise,
  toggleUnit,
  toggleRepsType,
  deleteSet,
  updateSetField,
  updateNote,
  updateRestTimer,
}: any) => {
  return (
    <ExerciseItem
      name={exercise.name}
      disablePress={disablePress}
      onDelete={() => deleteExercise(exercise.id)}
    >
      {/* ---------------- NOTES FIELD (ONE ROW) ---------------- */}
      <View style={styles.noteRow}>
        <Text style={styles.noteLabel}>Notes:</Text>

        <TextInput
          placeholder="Add note..."
          placeholderTextColor="#777"
          value={exercise.note}
          onChangeText={(text) => updateNote(exercise.id, text)}
          multiline
          style={styles.noteInput}
        />
      </View>

      {/* ---------------- REST TIMER FIELD ---------------- */}
      <TouchableOpacity style={styles.restButton} onPress={() => updateRestTimer(exercise.id)}>
        <Ionicons name="time-outline" size={18} color="#fff" />
        <Text style={styles.restText}>
          Rest-timer: {exercise.restTimer === 0 ? "Off" : `${exercise.restTimer}s`}
        </Text>
      </TouchableOpacity>

      {/* ---------------- LABELS ROW ---------------- */}
      <View style={styles.labelsRow}>
        <Text style={styles.label}>Reps</Text>
        <Text style={styles.label}>Weight</Text>
      </View>

      {/* ---------------- SET ROWS ---------------- */}
      {exercise.sets.map((set: any) => (
        <SetRow
          key={set.id}
          {...set}
          onRepsChange={(t:any) => updateSetField(exercise.id, set.id, "reps", t)}
          onWeightChange={(t:any) => updateSetField(exercise.id, set.id, "weight", t)}
          onToggleUnit={() => toggleUnit(exercise.id, set.id)}
          onToggleRepsType={() => toggleRepsType(exercise.id, set.id)}
          onDelete={() => deleteSet(exercise.id, set.id)}
        />
      ))}

      {/* ---------------- ADD SET BUTTON ---------------- */}
      <Pressable onPress={() => addSet(exercise.id)} style={styles.addSetButton}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>
    </ExerciseItem>
  )
}

const styles = StyleSheet.create({
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  noteLabel: {
    color: "#aaa",
    fontSize: 14,
    width: 55,
    paddingTop: 6,
  },

  noteInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: "#fff",
    minHeight: 35,
    backgroundColor: "transparent",
  },

  restButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    width: 170,
    gap: 6,
  },
  restText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  labelsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 8,
  marginBottom: 6,
},

label: {
  flex: 1,
  color: "#9CA3AF",
  fontWeight: "600",
  fontSize: 12,
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
})
