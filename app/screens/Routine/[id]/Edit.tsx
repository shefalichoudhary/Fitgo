import React, { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, FlatList} from "react-native";
import { Screen } from "@/components/Screen";
import LoadingOverlay from "@/components/LoadingOverlay";
import ExerciseBlock from "@/components/Routines/ExerciseBlock";
import { db } from "@/utils/storage";
import { routines, routineExercises, routineSets, exercises } from "@/utils/storage/schema";
import { eq, and } from "drizzle-orm";
import type { Exercise, DataShape } from "@/components/Routines/types";
import { mapExerciseToBlockProps } from "@/utils/mappers/mapExerciseToBlockProps";
import { updateRoutineDefinition } from "@/utils/updateRoutineDefinition";
import { useNavigation } from "@react-navigation/native";
import { Header } from "@/components/Header";
import { ConfirmModal } from "@/components/ConfirmModal";
import { InputField } from "@/components/InputField";
import Iconicons from "@expo/vector-icons/Ionicons";

type EditableExercise = {
  exercise: Exercise;
  data: DataShape;
};

type EditableRoutine = {
  id: string;
  title: string;
  exercises: EditableExercise[];
};

export default function EditRoutineScreen({ route }: any) {
  const { id: routineId } = route.params;
const navigation = useNavigation<any>();
  const [routine, setRoutine] = useState<EditableRoutine | null>(null);
  const [loading, setLoading] = useState(true);
const [confirmVisible, setConfirmVisible] = useState(false);
const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRoutine = async () => {
      try {
        const [routineRow] = await db.select().from(routines).where(eq(routines.id, routineId));

        if (!routineRow) {
          if (mounted) setRoutine(null);
          return;
        }

        const routineExerciseRows = await db
          .select()
          .from(routineExercises)
          .where(eq(routineExercises.routineId, routineId));

        const exercisesWithData: EditableExercise[] = await Promise.all(
          routineExerciseRows.map(async (re) => {
            const [exerciseRow] = await db
              .select()
              .from(exercises)
              .where(eq(exercises.id, re.exerciseId));

            const setRows = await db
              .select()
              .from(routineSets)
              .where(
                and(eq(routineSets.routineId, routineId), eq(routineSets.exerciseId, re.exerciseId))
              );

            const mappedSets = setRows.map((s) => {
              return {
                id: s.id,
                reps: s.reps ?? null,
                minReps: s.minReps ?? null,
                maxReps: s.maxReps ?? null,
                weight: s.weight ?? null,
                duration: s.duration ?? null,
                isCompleted: false,
                setType: s.setType ?? "Normal",
              };
            });

            const repsType = re.repsType ?? "reps";
            const unit = re.unit ?? "kg";

            const { exercise, data } = mapExerciseToBlockProps({
              id: re.exerciseId,
              exercise_name: exerciseRow!.exercise_name,
              exercise_type: exerciseRow!.exercise_type,
              equipment: exerciseRow!.equipment,
              notes: re.notes ?? "",
              restTimer: re.restTimer ?? 0,
              repsType,
              unit,
              sets: mappedSets,
            });

            return { exercise, data };
          })
        );

        if (!mounted) return;

        setRoutine({
          id: routineRow.id,
          title: routineRow.name,
          exercises: exercisesWithData,
        });
      } catch (err) {
        console.error("Failed to load routine:", err);
        if (mounted) setRoutine(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRoutine();
    return () => {
      mounted = false;
    };
  }, [routineId]);

const performUpdate = async () => {
  if (!routine || updating) return;

  try {
    setUpdating(true);

    const normalizedExercises = routine.exercises.map((e) => ({
      id: e.exercise.id,
      notes: e.data.notes,
      unit: e.data.unit,
      repsType: e.data.repsType,
      restTimer: e.data.restTimer,
      sets: e.data.sets,
    }));

    await updateRoutineDefinition(routine.id, {
      title: routine.title,
      exercises: normalizedExercises,
    });

    navigation.goBack();
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    setUpdating(false);
    setConfirmVisible(false);
  }
};

React.useLayoutEffect(() => {
  navigation.setOptions({
    header: () => (
      <Header
        title="Edit Routine"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        rightText="Update"
  onRightPress={() => setConfirmVisible(true)} 
      />
    ),
  });
}, [navigation, routine]);
  if (loading) {
    return <LoadingOverlay visible message="Loading routine..." />;
  }

  if (!routine) {
    return (
     <Screen
      contentContainerStyle={[
        { paddingHorizontal: 20, backgroundColor: "#000000ff" },
      ]}
    >
      {/* Icon */}
      <Iconicons
        name="barbell-outline"
        size={90}
        color="#666"
        style={{ marginBottom: 20 }}
      />

      {/* Title */}
      <Text
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        No Routines Yet
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          color: "#aaa",
          fontSize: 16,
          textAlign: "center",
          marginBottom: 25,
          width: "85%",
        }}
      >
        Routine not found. Please try again later.
      </Text>

     
    </Screen>
    );
  }

 return (
  <Screen preset="fixed" contentContainerStyle={styles.container}>
    <InputField
  placeholder="Routine title"
  value={routine.title}
  onChangeText={(title) =>
    setRoutine((prev) => (prev ? { ...prev, title } : prev))
  }
 
/>

    <FlatList
      data={routine.exercises}
      keyExtractor={(item:any) => item.exercise.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      renderItem={({ item }:any) => {
        const { exercise, data } = item;

        return (
          <ExerciseBlock
            exercise={exercise}
            data={data}
            onChange={(newData) => {
              setRoutine((prev) =>
                prev
                  ? {
                      ...prev,
                      exercises: prev.exercises.map((e) =>
                        e.exercise.id === exercise.id
                          ? { ...e, data: newData }
                          : e
                      ),
                    }
                  : prev
              );
            }}
            onOpenRepRange={() => {}}
            onOpenSetType={() => {}}
            onOpenRepsType={() => {}}
            onOpenRestTimer={() => {}}
            onToggleSetComplete={() => {}}
            onDeleteExercise={(exerciseId) => {
              setRoutine((prev) =>
                prev
                  ? {
                      ...prev,
                      exercises: prev.exercises.filter(
                        (e) => e.exercise.id !== exerciseId
                      ),
                    }
                  : prev
              );
            }}
          />
        );
      }}
    />
    <ConfirmModal
  visible={confirmVisible}
  title="Update routine?"
  message="This will overwrite the existing routine."
  onCancel={() => setConfirmVisible(false)}
  onConfirm={performUpdate}
  confirmText={updating ? "Updating..." : "Update"}
  cancelText="Cancel"
/>
  </Screen>
);
}

const styles = StyleSheet.create({
 container: { flex: 1, padding: 16, backgroundColor: "#000000ff" },
  titleInput: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    marginBottom: 16,
  },
});
