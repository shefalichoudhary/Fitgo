import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Screen } from "@/components/Screen";
import { useRoutine } from "@/context/RoutineContext";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  RoutineDetails: { id: string };
};

export default function RoutineDetailsScreen() {
  const { routines } = useRoutine();
  const route = useRoute<RouteProp<RootStackParamList, "RoutineDetails">>();
  const { id } = route.params;

  const routine = routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#777" />
        <Text style={styles.errorText}>Routine not found</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Routine Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{routine.title}</Text>
        <Text style={styles.subtitle}>
          {routine.exercises.length} {routine.exercises.length === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Exercises List */}
      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <View style={styles.setBadge}>
                <Text style={styles.setBadgeText}>
                  {item.sets?.length || 0} {item.sets?.length === 1 ? "set" : "sets"}
                </Text>
              </View>
            </View>
            {item.sets?.map((set:any, index:any) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setText}>
                  Set {index + 1}: {set.repsType === "range" ? `${set.reps} reps` : set.reps}    Volume: {set.weight} {set.unit}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
   
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  exerciseCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  setBadge: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  setBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  setRow: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  setText: {
    color: "#E5E5E5",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 12,
  },
});
