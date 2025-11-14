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
    <View style={styles.setsContainer}>
      {exercise.sets.map((set, idx) => (
        <SetRow key={set.id} idx={idx} set={set} onToggle={() => onToggleSet(set.id)} />
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    paddingTop: 10,
  },
})
