import React, { useCallback, useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Button";
import ExerciseBlock from "@/components/Routines/ExerciseBlock"; // <- new component
import { EmptyRoutineState } from "@/components/Routines/EmptyRoutineState";
import { useRoutineHelpers } from "@/components/Routines/useRoutineHelpers";
import { useCreateRoutine } from "../../../hooks/useCreateRoutine";
import { AppAlert } from "@/components/AppAlert";
import { useNavigation } from "@react-navigation/native";
import type { HomeStackParamList } from "@/navigators/navigationTypes";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type SetField =
  | "weight"
  | "reps"
  | "minReps"
  | "maxReps"
  | "duration"
  | "isRangeReps"
  | "previousWeight"
  | "previousReps"
  | "previousMinReps"
  | "previousMaxReps"
  | "previousUnit"
  | "previousRepsType"
  | "previousDuration"
  | "isCompleted"
  | "setType"
  | "unit"
  | "repsType";

export default function CreateRoutineScreen() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "CreateRoutine">>();

  const { title, setTitle, exercises, setExercises, deleteExercise, saveRoutine } =
    useCreateRoutine([]);

  const {
    toggleRepsType,
    updateSetField: rawUpdateSetField,
    updateRestTimer,
  } = useRoutineHelpers(setExercises);

  const updateSetField = React.useCallback(
    (exerciseId: string, setId: string, field: SetField, value: any) => {
      (rawUpdateSetField as unknown as (eId: string, sId: string, f: SetField, v: any) => void)(
        exerciseId,
        setId,
        field,
        value
      );
    },
    [rawUpdateSetField]
  );

 useFocusEffect(
  useCallback(() => {
    if (!route.params?.selectedExercises) return;

    const withSets = route.params.selectedExercises.map((rawEx: any, i: number) => {
      const id = rawEx.id ?? rawEx._id ?? `sel-${Date.now()}-${i}`;
      const exercise_name = rawEx.exercise_name ?? rawEx.name ?? rawEx.title ?? "Exercise";
      const exercise_type = rawEx.exercise_type ?? rawEx.exerciseType ?? rawEx.type ?? null;
      const equipment = rawEx.equipment ?? rawEx.equip ?? rawEx.machine ?? "";
      const sets = (rawEx.sets || []).map((s: any, j: number) => ({
        id: s.id ?? `${Date.now()}-${j}`,
        reps: s.reps ?? null,
        weight: s.weight ?? null,
        duration: s.duration ?? null,
        repsType: s.repsType ?? s.reps_type ?? "reps",
        unit: s.unit ?? "kg",
        isCompleted: s.isCompleted ?? false,
      }));

      return {
        ...rawEx, // keep extra fields
        id,
        exercise_name,
        exercise_type,
        equipment,
        restTimer: rawEx.restTimer ?? 0,
        sets,
        unit: rawEx.unit ?? "kg",
        repsType: rawEx.repsType ?? "reps",
        notes: rawEx.notes ?? "",
      };
    });

    setExercises((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newExercises = withSets.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newExercises];
    });
  }, [route.params, setExercises])
);


  const handleSaveRoutine = async () => {
    const success = await saveRoutine();
    if (success) {
      setAlertMessage("Routine saved successfully!");
      setAlertVisible(true);

      setTimeout(() => {
        navigation.navigate("Routines");
      }, 500);
    } else {
      setAlertMessage("Failed to save routine. Please try again.");
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setExercises([]);
      setTitle("");
    });

    return unsubscribe;
  }, [navigation, setExercises, setTitle]);

  const saveDisabled = !title.trim() || exercises.some((ex: any) => (ex.sets || []).length === 0);

  const handleExerciseChange = (exerciseId: string, newData: any) => {
    setExercises((prev: any[]) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...newData } : ex))
    );
  };

  const handleOpenRepRange = (exerciseId: string, setIndex: number) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    const setId = ex?.sets?.[setIndex]?.id;
    if (setId) {
      toggleRepsType(exerciseId, setId);
    }
  };

  const handleToggleSetComplete = (exerciseId: string, setIndex: number, completed: boolean) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    const setId = ex?.sets?.[setIndex]?.id;
    if (setId) {
      updateSetField(exerciseId, setId, "isCompleted", completed);
    }
  };

  const handleOpenSetType = (exerciseId: string, setIndex?: number) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    if (!ex) return;
    if (setIndex == null) return;

    const setRow = ex.sets?.[setIndex];
    if (!setRow) return;
    const current = setRow.setType ?? "Normal";
    const order = ["W", "Normal", "D", "F"];
    const next = order[(order.indexOf(current) + 1) % order.length] ?? "Normal";
    updateSetField(exerciseId, setRow.id, "setType", next);
  };

  const handleOpenRepsType = (exerciseId: string) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    if (!ex) return;
    const next = ex.repsType === "reps" ? "rep range" : "reps";
    setExercises((prev: any[]) =>
      prev.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              repsType: next,
              sets: (item.sets || []).map((s: any) => ({ ...s, repsType: next })),
            }
          : item
      )
    );
  };

  const handleOpenRestTimer = (exerciseId: string) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    const next = (ex?.restTimer ?? 0) + 30; // example: add 30s when opening
    updateRestTimer(exerciseId, next);
  };

  // delete exercise adapter
  const handleDeleteExercise = (exerciseId: string) => {
    deleteExercise(exerciseId);
    setExercises((prev: any[]) => prev.filter((e) => e.id !== exerciseId));
  };
  return (
    <View style={styles.container}>
      <InputField placeholder="Enter routine title" value={title} onChangeText={setTitle} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          
          <ExerciseBlock
            exercise={{
              id: item.id,
              exercise_name: item.exercise_name ?? item.name ?? "Exercise",
              exercise_type: item.exercise_type ?? item.exerciseType ?? item.type ?? null,
              equipment: item.equipment ?? "",
            }}
            data={{
              notes: item.notes ?? "",
              restTimer: item.restTimer ?? 0,
              sets: item.sets ?? [],
              unit: item.unit ?? "kg",
              repsType: item.repsType ?? "reps",
            }}
            onChange={(newData) => handleExerciseChange(item.id, newData)}
            onStartTimer={() => {
              /* optionally start a timer UI */
            }}
            onOpenRepRange={(exerciseId, setIndex) => handleOpenRepRange(exerciseId, setIndex)}
            showCheckIcon={false}
            onDeleteExercise={(exerciseId) => handleDeleteExercise(exerciseId)}
            viewOnly={false}
            onOpenSetType={(exerciseId, setIndex) => handleOpenSetType(exerciseId, setIndex)}
            onOpenRepsType={(exerciseId) => handleOpenRepsType(exerciseId)}
            onOpenRestTimer={(exerciseId) => handleOpenRestTimer(exerciseId)}
            onToggleSetComplete={(exerciseId, setIndex, completed) =>
              handleToggleSetComplete(exerciseId, setIndex, completed)
            }
          />
        )}
        ListEmptyComponent={<EmptyRoutineState />}
        contentContainerStyle={exercises.length === 0 && styles.empty}
      />

      <View style={styles.buttons}>
        <Button
          text="Add Exercise"
          preset="filled"
          onPress={() =>
            navigation.navigate("Exercises", { alreadyAdded: exercises.map((e) => e.id) })
          }
          style={[styles.btn, { backgroundColor: "#3B82F6" }]}
        />

        {exercises.length > 0 && (
          <Button
            text="Save Routine"
            preset="filled"
            onPress={handleSaveRoutine}
            disabled={saveDisabled}
            style={[styles.btn, { backgroundColor: "#10B981", opacity: saveDisabled ? 0.5 : 1 }]}
          />
        )}
      </View>

      <AppAlert
        visible={alertVisible}
        message={alertMessage}
        onHide={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000ff", padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  buttons: { marginTop: 0 },
  btn: { borderRadius: 8, marginBottom: 6 },
});
