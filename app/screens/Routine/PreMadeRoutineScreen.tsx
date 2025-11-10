// PremadeRoutineScreen.tsx

import React from "react"
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"

const routines = [
  { id: "1", name: "Full Body Burn", duration: "30 mins", exercises: 6 },
  { id: "2", name: "Upper Body Strength", duration: "45 mins", exercises: 7 },
  { id: "3", name: "Leg Day Power", duration: "40 mins", exercises: 5 },
]

export default function PremadeRoutineScreen({ navigation }: any) {
  const renderRoutineCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RoutineDetails", { routineId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardSubtitle}>
        {item.exercises} Exercises • {item.duration}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutineCard}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000000", // Black background
  },

  card: {
    backgroundColor: "#1A1A1A", // Dark gray card
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    color: "#A1A1A1",
    fontSize: 14,
    marginTop: 6,
  },
  startButton: {
    backgroundColor: "#3B82F6", // Blue accent
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})
