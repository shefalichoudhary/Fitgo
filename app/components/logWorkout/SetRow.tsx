import React from "react"
import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import { AntDesign } from "@expo/vector-icons"

export const SetRow = ({
  idx,
  set,
  onToggle,
}: {
  idx: number
  set: { id: string; reps: number; weight: number; completed: boolean }
  onToggle: () => void
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[styles.container, set.completed && styles.completedRow]}
    >
      <View style={styles.setInfo}>
        <Text style={[styles.setText, set.completed && styles.completedText]}>Set {idx + 1}</Text>
        <Text style={[styles.repText, set.completed && styles.completedText]}>
          {set.reps} × {set.weight} kg
        </Text>
      </View>

      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkBox, set.completed && styles.checkedBox]}
      >
        {set.completed && <AntDesign name="check" size={18} color="#fff" />}
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  completedRow: {
    backgroundColor: "#1F40FF33", // subtle blue highlight
  },
  setInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  setText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 12,
  },
  repText: {
    color: "#ccc",
    fontSize: 14,
  },
  completedText: {
    color: "#fff",
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
})
