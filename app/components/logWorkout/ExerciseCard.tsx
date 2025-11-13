import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SetRow } from "./SetRow"

export const ExerciseCard = ({
  exercise,
  onToggleSet,
}: {
  exercise: {
    id: string
    name: string
    sets: { id: string; reps: number; weight: number; completed: boolean }[]
  }
  onToggleSet: (setId: string) => void
}) => (
  <View style={styles.card}>
    <Text style={styles.title}>{exercise.name}</Text>
    {exercise.sets.map((set, idx) => (
      <SetRow key={set.id} idx={idx} set={set} onToggle={() => onToggleSet(set.id)} />
    ))}
  </View>
)

const styles = StyleSheet.create({
  card: { marginBottom: 16, padding: 12, backgroundColor: "#1E1E1E", borderRadius: 10 },
  title: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 8 },
})
