import React, { useCallback, useState,useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { navigate } from "@/navigators/navigationUtilities";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Button";
import { ExerciseList } from "@/components/Routines/ExerciseList";
import { EmptyRoutineState } from "@/components/Routines/EmptyRoutineState";
import { useRoutineHelpers } from "@/components/Routines/useRoutineHelpers";
import { useCreateRoutine } from "../../../hooks/useCreateRoutine";
import { AppAlert } from "@/components/AppAlert";
import { useNavigation } from "@react-navigation/native";
import type { HomeStackParamList } from "@/navigators/navigationTypes";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function CreateRoutineScreen() {
    const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
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

  const { addSet, toggleRepsType, toggleUnit, updateSetField , updateNote , updateRestTimer } = useRoutineHelpers(setExercises);

 useFocusEffect(
  useCallback(() => {
    if (route.params?.selectedExercises) {
      const withSets = route.params.selectedExercises.map((ex) => ({
        ...ex,
        restTimer: ex.restTimer ?? 0,
        sets: (ex.sets || []).map((set, i) => ({
          id: `${Date.now()}-${i}`,
          reps: String(set.reps ?? ""),
          weight: String(set.weight ?? ""),
          repsType: (set as any).repsType ?? "reps",
          unit: (set as any).unit ?? "kg",
        })),
      }));

      setExercises((prev) => {
        // Prevent duplicates
        const existingIds = new Set(prev.map((e) => e.id));
        const newExercises = withSets.filter((e) => !existingIds.has(e.id));
        return [...prev, ...newExercises];
      });
    }
  }, [route.params])
);

const handleSaveRoutine = async () => {
  const success = await saveRoutine();
  if (success) {
    setAlertMessage("Routine saved successfully!");
    setAlertVisible(true);

    // Navigate to RoutineScreen after a short delay (so the alert is visible)
    setTimeout(() => {
      navigation.navigate("Routines"); // replace "Routine" with your exact route name
    }, 500);
  } else {
    setAlertMessage("Failed to save routine. Please try again.");
    setAlertVisible(true);
  }
};


useEffect(() => {
  const unsubscribe = navigation.addListener("beforeRemove", (e) => {
    // Reset your state before leaving
    setExercises([]);
    setTitle("");
  });

  return unsubscribe;
}, [navigation]);
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
           updateRestTimer={updateRestTimer}
            updateNote={updateNote}
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
  onPress={() => 
    navigation.navigate("Exercises", { alreadyAdded: exercises.map(e => e.id) })
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
