import React from "react"
import { StyleSheet, Text, Pressable, View, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons" // Icon package
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
export default function RoutineScreen() {
  const router = useRouter()

  // Sample routines (you can replace with real data)
  const routines = [
    { id: "1", name: "Full Body Workout" },
    { id: "2", name: "Upper Body Strength" },
    { id: "3", name: "Leg Day Blast" },
  ]

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={styles.screen}>

    

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>Routines</Text>

        <Pressable onPress={() => router.push("/routine/create")}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Existing routines */}
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.routineItem}
            onPress={() => router.push(`/routine/${item.id}`)}
          >
            <Text style={styles.routineText}>{item.name}</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.routineList}
      />

    

    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1a1a1a", // Dark background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  routineList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  routineItem: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  routineText: {
    color: "#fff",
    fontSize: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  singleCard: {
    marginTop: 16,
    marginRight: 0,
  },
   cardText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})