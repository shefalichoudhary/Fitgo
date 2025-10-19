import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { $styles } from "@/theme/styles"
// Type for an Exercise
type Exercise = {
  name: string;
  sets: number;
};

// Type for a Workout
type Workout = {
  id: string;
  name: string;
  duration: number; // in seconds
  exercises: Exercise[];
};

// Hardcoded motivational quotes
const MOTIVATIONAL_QUOTES: string[] = [
  "Push yourself, because no one else is going to do it for you.",
  "Success starts with self-discipline.",
  "Every workout counts. Keep going!",
  "Small progress is still progress.",
  "Your body can stand almost anything. It’s your mind you have to convince.",
  "Don’t limit your challenges. Challenge your limits.",
  "Sweat is just fat crying.",
  "Take care of your body. It’s the only place you have to live.",
  "Eat for the body you want, not for the body you have.",
  "Consistency is the key to success.",
];

export const HomeScreen: React.FC = () => {
    
    
  const workout: Workout = {
    id: "w1",
    name: "Full Body Workout",
    duration: 900, // 15 min
    exercises: [
      { name: "Push-ups", sets: 3 },
      { name: "Squats", sets: 3 },
      { name: "Plank", sets: 2 },
    ],
  };

  const [quotes] = useState(MOTIVATIONAL_QUOTES);

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

        {/* Motivational Quotes Section */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Motivation</Text>
          {quotes.map((quote, idx) => (
            <View key={idx} style={styles.quoteCard}>
              <Text style={styles.quoteText}>💡 {quote}</Text>
            </View>
          ))}
        </View>
    </Screen>
  );
};
const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const styles = StyleSheet.create({
  card: { backgroundColor: "#333", borderRadius: 12, padding: 12, marginBottom: 16 },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  cardSubTitle: { color: "#aaa", fontSize: 14, marginBottom: 8 },
  exercisesContainer: { marginBottom: 8 },
  exerciseRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  exerciseText: { color: "#fff", fontSize: 14 },
  button: { backgroundColor: "#007BFF", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  feedSection: { marginTop: 16 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  quoteCard: { backgroundColor: "#444", borderRadius: 12, padding: 12, marginTop: 8 },
  quoteText: { color: "#fff", fontSize: 14, fontStyle: "italic" },
});
