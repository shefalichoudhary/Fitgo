import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Screen } from "@/components/Screen";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import LoadingOverlay from "@/components/LoadingOverlay";
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema";
import { eq, and } from "drizzle-orm";

type RoutineWithExercises = {
  id: string;
  title: string;
  exercises: {
    id: string;
    name: string;
    notes?: string;
    unit: "kg" | "lbs";
    repsType: "reps" | "rep range";
    restTimer?: number;
    sets: {
      id: string;
      reps: number;
      minReps?: number | null;
      maxReps?: number | null;
      weight: number;
    }[];
  }[];
};

export default function RoutineDetailsScreen({ navigation, route }: any) {
  const { id } = route.params;

  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const [routineRow] = await db
          .select()
          .from(routines)
          .where(eq(routines.id, id));

        if (!routineRow) {
          setRoutine(null);
          return;
        }

        const routineExerciseRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, id));

        const exercisesWithSets = await Promise.all(
          routineExerciseRows.map(async (re) => {
            const [exerciseRow] = await db
              .select()
              .from(exercises)
              .where(eq(exercises.id, re.exerciseId));

            const setRows = await db
              .select()
              .from(routineSets)
              .where(
                and(
                  eq(routineSets.routineId, id),
                  eq(routineSets.exerciseId, re.exerciseId)
                )
              );

            return {
              id: re.exerciseId,
              name: exerciseRow?.exercise_name ?? "Unnamed Exercise",
              notes: re.notes ?? "",
              unit: (re.unit ?? "kg") as "kg" | "lbs",
              repsType: (re.repsType ?? "reps") as "reps" | "rep range",
              restTimer: re.restTimer ?? 0,
              sets: setRows.map((s) => ({
                id: s.id,
                reps: s.reps ?? 0,
                minReps: s.minReps ?? null,
                maxReps: s.maxReps ?? null,
                weight: s.weight,
              })),
            };
          })
        );

        setRoutine({
          id: routineRow.id,
          title: routineRow.name,
          exercises: exercisesWithSets,
        });
      } catch (err) {
        console.error("Failed to load routine:", err);
        setRoutine(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [id]);

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <LoadingOverlay visible message="Loading routine..." />
      </Screen>
    );
  }

  if (!routine) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={56} color="#777" />
        <Text style={styles.errorText}>Routine not found</Text>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{routine.title}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditRoutine", { id: routine.id })}
          >
            <AntDesign name="edit" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {routine.exercises.length}{" "}
          {routine.exercises.length === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Exercises */}
      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        renderItem={({ item: ex }) => (
          <View style={styles.exerciseCard}>
            {/* Top row */}
            <View style={styles.exerciseTopRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.chipPrimary}>
                  <Text style={styles.chipText}>{ex.repsType}</Text>
                </View>
                <View style={styles.chipOutline}>
                  <Text style={styles.chipOutlineText}>{ex.unit}</Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {ex.notes ? (
              <Text style={styles.notesText}>{ex.notes}</Text>
            ) : null}

            {/* Rest Timer */}
            {ex.restTimer ? (
              <View style={styles.restChip}>
                <Ionicons name="timer-outline" size={14} color="#93C5FD" />
                <Text style={styles.restText}>{ex.restTimer}s rest</Text>
              </View>
            ) : null}

            {/* Sets */}
            <View style={styles.setsContainer}>
              {ex.sets.map((set, i) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setIndex}>{i + 1} ~ </Text>

                  <Text style={styles.setValue}>
                    {ex.repsType === "rep range"
                      ? `${set.minReps}-${set.maxReps} reps`
                      : `${set.reps} reps`}
                  </Text>

                  <Text style={styles.setWeight}>
                    {set.weight} {ex.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  header: { marginBottom: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#9CA3AF", fontSize: 14, marginTop: 4 },

  exerciseCard: {
    backgroundColor: "#161616",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  exerciseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },

  metaRow: { flexDirection: "row", gap: 8 },

  chipPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  chipOutline: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipOutlineText: {
    color: "#D1D5DB",
    fontSize: 11,
    fontWeight: "600",
  },

  notesText: {
    marginTop: 6,
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
  },

  restChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  restText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
  },

  setsContainer: { marginTop: 12, gap: 8 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  setIndex: { color: "#9CA3AF", width: 28, fontSize: 13 },
  setValue: { color: "#fff", fontSize: 14, flex: 1 },
  setWeight: { color: "#93C5FD", fontSize: 14, fontWeight: "600" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#aaa", marginTop: 12, fontSize: 16 },
  
});
