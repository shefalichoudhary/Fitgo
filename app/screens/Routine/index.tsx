
import React from "react"
import { StyleSheet, Text, Pressable, View, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { useRoutine } from "@/context/RoutineContext"

import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type RootStackParamList = {
  RoutineDetails: { id: string }
}

export default function RoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { routines } = useRoutine()
console.log("Routines in RoutineScreen:", routines);
  return (
    <Screen  contentContainerStyle={styles.container}>
      {routines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={72} color="#555" />
          <Text style={styles.emptyTitle}>No Routines Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first workout routine and start tracking your progress.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.routineCard}
              onPress={() => navigation.navigate("RoutineDetails", { id: item.id })}
            >
              <View>
                <Text style={styles.routineText}>{item.title}</Text>
                <Text style={styles.routineSubText}>
                  {item.exercises.length} exercises
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </Pressable>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </Screen>
  )
}


const styles = StyleSheet.create({
  container: {
   flexGrow: 1,
      paddingVertical: 10,
    backgroundColor: "#121212",
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  routineCard: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routineText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  routineSubText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 100,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },})