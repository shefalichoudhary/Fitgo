import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useNavigation } from "@react-navigation/native"
import type { AppStackParamList } from "@/navigators/navigationTypes"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type Exercise = {
  name: string
  sets: number
}

type Workout = {
  id: string
  name: string
  duration: number // in seconds
  exercises: Exercise[]
}

export const HomeScreen: React.FC = () => {
const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  const workout: Workout = {
    id: "w1",
    name: "Full Body Workout",
    duration: 900,
    exercises: [
      { name: "Push-ups", sets: 3 },
      { name: "Squats", sets: 3 },
      { name: "Plank", sets: 2 },
    ],
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container} safeAreaEdges={["top"]}>
      {/* Workout Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{workout.name}</Text>
        <Text style={styles.cardSubTitle}>
          Duration: {Math.floor(workout.duration / 60)} min {workout.duration % 60} sec
        </Text>
        <View style={styles.exercisesContainer}>
          {workout.exercises.map((ex, idx) => (
            <View key={idx} style={styles.exerciseRow}>
              <Text style={styles.exerciseText}>{ex.name}</Text>
              <Text style={styles.exerciseText}>{ex.sets} sets</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom UI Options */}
      <View style={styles.bottomBox}>
        <View style={styles.row}>
          {/* ✅ Navigate to /routine */}
         <TouchableOpacity
            style={styles.optionCard}
      onPress={() => navigation.navigate("Routine")}  // 👈 updated
          >
            <Text style={styles.optionText}>Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => console.log("Pre-Made Routine Pressed")} // Optional: set up your own route
          >
            <Text style={styles.optionText}>Pre-Made Routine</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.optionCard, styles.fullWidthCard]}
          onPress={() => console.log("Measurement Pressed")} // Optional: set up your own route
        >
          <Text style={styles.optionText}>Measurement</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 20, marginBottom: 6 },
  cardSubTitle: { color: "#aaa", fontSize: 14, marginBottom: 12 },
  exercisesContainer: { marginBottom: 8 },
  exerciseRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  exerciseText: { color: "#eee", fontSize: 14 },

  bottomBox: { marginTop: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: "#2b2b2d",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 7,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fullWidthCard: {
    width: "100%",
  },
  optionText: { color: "#fff", fontWeight: "600", fontSize: 16, textAlign: "center" },
})
