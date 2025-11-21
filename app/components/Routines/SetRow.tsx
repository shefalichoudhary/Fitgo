// components/SetRow.tsx
import React from "react"
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Props = {
  reps: string
  weight: string
  repsType: "reps" | "range"
  unit: "kg" | "lbs"
  onRepsChange: (text: string) => void
  onWeightChange: (text: string) => void
  onToggleUnit: () => void
  onToggleRepsType: () => void
  onOpenRestTimer: () => void
  onDelete?: () => void // NEW: delete callback
  note: string
onChangeNote: (text: string) => void
restTimer: number
onChangeRestTimer: (value: number) => void
}

export const SetRow: React.FC<Props> = ({
  reps,
  weight,
  repsType,
  onRepsChange,
  onWeightChange,

  onDelete,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrapper}>
        <TextInput
          value={reps}
          onChangeText={onRepsChange}
          placeholder={repsType === "range" ? "8-10" : "Reps"}
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="numeric"
        />
       
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          value={weight}
          onChangeText={onWeightChange}
          placeholder="Kg"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="numeric"
        />
       
      </View>

      {/* Delete button */}
      {onDelete && (
        <Pressable
  onPress={onDelete}
  style={({ pressed }) => [
    { padding: 6, opacity: pressed ? 0.6 : 1 }
  ]}
>
  <Ionicons name="trash-outline" size={20} color="#EF4444" />
</Pressable>

      )}
    </View>
  )
}

const styles = StyleSheet.create({
row: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
  backgroundColor: "#1F1F1F",
  borderRadius: 8,
  padding: 4,
},
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#fff",
  },
  toggle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#2A2A2A",
  },
  toggleText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  deleteButton: {
    padding: 6,
  },
})
