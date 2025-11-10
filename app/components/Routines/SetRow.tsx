// components/SetRow.tsx
import React from "react"
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native"

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
}

export const SetRow: React.FC<Props> = ({
  reps,
  weight,
  repsType,
  unit,
  onRepsChange,
  onWeightChange,
  onToggleUnit,
  onToggleRepsType,
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
        <Pressable onPress={onToggleRepsType} style={styles.toggle}>
          <Text style={styles.toggleText}>{repsType === "reps" ? "R" : "Rng"}</Text>
        </Pressable>
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
        <Pressable onPress={onToggleUnit} style={styles.toggle}>
          <Text style={styles.toggleText}>{unit}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  rest: {
    width: 40,
    alignItems: "center",
  },
  restText: {
    fontSize: 20,
    color: "#3b82f6",
  },
})
