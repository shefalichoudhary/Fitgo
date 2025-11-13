import React, { useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { navigate } from "@/navigators/navigationUtilities";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Button";
import { ExerciseList } from "@/components/Routines/ExerciseList";
import { EmptyRoutineState } from "@/components/Routines/EmptyRoutineState";
import { useRoutineHelpers } from "@/components/Routines/useRoutineHelpers";
import { useCreateRoutine } from "../../../hooks/useCreateRoutine";
import type { HomeStackParamList } from "@/navigators/navigationTypes";

export default function CreateRoutineScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, "CreateRoutine">>();
  const {
    title,
    setTitle,
    exercises,
    setExercises,
    deleteSet,
    deleteExercise,
    saveRoutine,
  } = useCreateRoutine([]);

  const { addSet, toggleRepsType, toggleUnit, updateSetField } = useRoutineHelpers(setExercises);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.selectedExercises) {
        const withSets = route.params.selectedExercises.map((ex) => ({
          ...ex,
          sets: (ex.sets || []).map((set, i) => ({
            id: `${Date.now()}-${i}`,
            reps: String(set.reps ?? ""),
            weight: String(set.weight ?? ""),
            repsType: (set as any).repsType ?? "reps",
            unit: (set as any).unit ?? "kg",
          })),
        }));
        setExercises(withSets);
      }
    }, [route.params])
  );

  const saveDisabled = !title.trim() || exercises.some((ex :any) => ex.sets.length === 0);

  return (
    <View style={styles.container}>
      <InputField placeholder="Enter routine title" value={title} onChangeText={setTitle} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseList
            exercise={item}
            addSet={addSet}
            toggleUnit={toggleUnit}
            toggleRepsType={toggleRepsType}
            updateSetField={updateSetField}
            deleteSet={deleteSet}
            deleteExercise={() => deleteExercise(item.id)}
             disablePress={true} 
          />
        )}
        ListEmptyComponent={<EmptyRoutineState />}
        contentContainerStyle={exercises.length === 0 && styles.empty}
      />

      <View style={styles.buttons}>
        <Button
          text="Add Exercise"
          preset="filled"
          onPress={() => navigate("Exercises")}
          style={[styles.btn, { backgroundColor: "#3B82F6" }]}
        />
        <Button
          text="Save Routine"
          preset="filled"
          onPress={saveRoutine}
          disabled={saveDisabled}
          style={[styles.btn, { backgroundColor: "#10B981", opacity: saveDisabled ? 0.5 : 1 }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030303", padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  buttons: { marginTop: 0 },
  btn: { borderRadius: 8, marginBottom: 6 },
});
