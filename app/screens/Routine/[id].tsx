import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Screen } from "@/components/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema";
import { eq, and } from "drizzle-orm";
import AntDesign from "@expo/vector-icons/AntDesign";

type RootStackParamList = {
  RoutineDetails: { id: string };
};

type RoutineWithExercises = {
  id: string;
  title: string;
  exercises: {
    id: string;
    name: string;
    notes?: string;
    sets: {
      id: string;
      reps: number;
      weight: number;
      unit: "lbs" | "kg";
      repsType: "reps" | "rep range";
    }[];
  }[];
};

export default function RoutineDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RoutineDetails">>();
  const { id } = route.params;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [titleEditing, setTitleEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const [routineRow] = await db.select().from(routines).where(eq(routines.id, id));
        if (!routineRow) {
          setRoutine(null);
          setLoading(false);
          return;
        }

        const exercisesRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, id));

        const exercisesWithSets = await Promise.all(
          exercisesRows.map(async (ex) => {
            const [exerciseRow] = await db
              .select()
              .from(exercises)
              .where(eq(exercises.id, ex.exerciseId));

            const setsRows = await db
              .select()
              .from(routineSets)
              .where(and(eq(routineSets.routineId, id), eq(routineSets.exerciseId, ex.exerciseId)));

            return {
              id: ex.exerciseId,
              name: exerciseRow?.exercise_name || "Unnamed Exercise",
              sets: setsRows.map((s) => ({
                id: s.id,
                reps: s.reps ?? 0,
                weight: s.weight,
                unit: "kg" as "lbs" | "kg",
                repsType: "reps" as "reps" | "rep range",
              })),
            };
          })
        );

        setRoutine({
          id: routineRow.id,
          title: routineRow.name,
          exercises: exercisesWithSets,
        });
        setTitle(routineRow.name);
      } catch (err) {
        console.error("Failed to fetch routine:", err);
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
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </Screen>
    );
  }

  const saveTitle = () => {
    if (!routine) return;
    if (title === routine.title) {
      setTitleEditing(false);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    if (!routine) return;
    try {
      await db.update(routines).set({ name: title }).where(eq(routines.id, routine.id));
      setRoutine({ ...routine, title });
    } catch (err) {
      console.error("Failed to update title:", err);
    } finally {
      setShowConfirmModal(false);
      setTitleEditing(false);
    }
  };

  const cancelUpdate = () => {
    setTitle(routine?.title || "");
    setShowConfirmModal(false);
    setTitleEditing(false);
  };

  if (!routine) {
    return (
      <Screen preset="fixed" contentContainerStyle={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#777" />
        <Text style={styles.errorText}>Routine not found...</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Routine Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {titleEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              onBlur={saveTitle}
              onSubmitEditing={saveTitle}
              autoFocus
            />
          ) : (
            <Text style={styles.title}>{routine.title}</Text>
          )}
          {!titleEditing && (
            <TouchableOpacity onPress={() => setTitleEditing(true)}>
              <AntDesign name="edit" size={24} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {routine.exercises.length} {routine.exercises.length === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Exercises List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {routine.exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.notesText}>{ex.notes}</Text>
              <View style={styles.setBadge}>
                <Text style={styles.setBadgeText}>
                  {ex.sets.length} {ex.sets.length === 1 ? "set" : "sets"}
                </Text>
              </View>
            </View>

            {ex.sets.map((set, i) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setText}>
                  Set {i + 1}: {set.repsType === "rep range" ? `${set.reps} reps` : set.reps} •{" "}
                  {set.weight} {set.unit}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Routine</Text>
            <Text style={styles.modalMessage}>Do you want to update the routine title?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelUpdate}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonUpdate]}
                onPress={confirmUpdate}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000000ff",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  titleInput: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    paddingVertical: 2,
    flex: 1,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 4,
  },
  exerciseCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  setBadge: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  setBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginBottom: 6,
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
  notesText: {
    color: "#D1D5DB", // lighter gray
    fontSize: 13,
    marginBottom: 8,
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#4B5563",
  },
  modalButtonUpdate: {
    backgroundColor: "#2563EB",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
