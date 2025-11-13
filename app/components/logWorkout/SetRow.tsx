import React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"

export const SetRow = ({
  idx,
  set,
  onToggle,
}: {
  idx: number
  set: { id: string; reps: number; weight: number; completed: boolean }
  onToggle: () => void
}) => (
  <TouchableOpacity
    style={[styles.setRow, set.completed && styles.completedSet]}
    onPress={onToggle}
  >
    <Text style={styles.setText}>
      Set {idx + 1}: {set.reps} reps × {set.weight} kg
    </Text>
    <Text style={styles.setText}>{set.completed ? "✔️" : "❌"}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
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
