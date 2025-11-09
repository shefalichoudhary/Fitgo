import React from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Screen } from "@/components/Screen"
import { useRoutine } from "@/context/RoutineContext"
import { Ionicons } from "@expo/vector-icons"

export default function RoutineDetailsScreen() {
  const { id } = useLocalSearchParams()
  const { routines } = useRoutine()

  const routine = routines.find((r) => r.id === id)

  if (!routine) {
    return (
      <Screen preset="scroll" contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#aaa" />
        <Text style={styles.errorText}>Routine not found</Text>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <Text style={styles.title}>{routine.title}</Text>
      <Text style={styles.subtitle}>
        {routine.exercises.length} exercises
      </Text>

      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDetail}>
              {item.sets?.length || 0} sets
            </Text>
          </View>
        )}
        contentContainerStyle={{ marginTop: 16 }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseDetail: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 12,
  },
})
