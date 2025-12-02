// LogWorkoutScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useWorkoutData } from "../../../hooks/useWorkoutData";
import { WorkoutSummary } from "@/components/logWorkout/WorkoutSummary";
import ExerciseBlock from "@/components/Routines/ExerciseBlock"; // <--- use ExerciseBlock directly
import { saveWorkoutSession } from "@/utils/workout";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/utils/user";
import { AppAlert } from "@/components/AppAlert";

export default function LogWorkoutScreen() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [navigateAfterAlert, setNavigateAfterAlert] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { routineId } = route.params;
  const {
    routineTitle,
    exercisesData, 
    duration,
    setExercisesData,
    toggleSetCompletion,
  removeExercise,
  } = useWorkoutData(routineId);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
    })();
  }, []);

  const totalSets = exercisesData.reduce((a, e) => a + (e.sets?.length ?? 0), 0);
  const completedSets = exercisesData.reduce(
    (a, e) => a + (e.sets?.filter((s: any) => s.completed).length ?? 0),
    0
  );
  const totalVolume = exercisesData.reduce(
    (a, e) =>
      a +
      (e.sets?.reduce((v: number, s: any) => v + (s.completed ? (s.reps ?? 0) * (s.weight ?? 0) : 0), 0) ?? 0),
    0
  );

 const handleSave = async () => {
  const anyCompleted = exercisesData.some((ex) =>
  ex.sets.some((s) => s.completed === true)
);

if (!anyCompleted) {
  setAlertMessage("Please complete at least one set before saving the workout.");
  setAlertVisible(true);
  return;
}

  // 3️⃣ User must be logged in
  if (!user) {
    setAlertMessage("User not found. Please log in first.");
    setAlertVisible(true);
    return;
  }

  // 4️⃣ All good → save workout
  try {
    await saveWorkoutSession({
      userId: user.id,
      routineId,
      routineName: routineTitle,
      totalSets,
      completedSets,
      totalVolume,
      duration,
      exercises: exercisesData,
    });

    setAlertMessage("Workout Saved! Your workout has been added to History.");
    setNavigateAfterAlert(true);
    setAlertVisible(true);
  } catch (err) {
    console.error("saveWorkoutSession failed:", err);
    setAlertMessage("Failed to save workout. Please try again.");
    setAlertVisible(true);
  }
};


  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title="Log Workout"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          rightText="Save"
          onRightPress={handleSave}
        />
      ),
    });
  }, [navigation, routineTitle, duration, totalSets, completedSets, totalVolume, user]);

  // ---------- Helpers to adapt exerciseData -> ExerciseBlock props ----------
  // Map your exercise item to ExerciseBlock's props
  const renderExercise = useCallback(
    ({ item }: { item: any }) => {
      // Ensure sets exist and map completed -> isCompleted to match ExerciseBlock/SetRow expectation
      const mappedSets = (item.sets || []).map((s: any) => ({
        id: s.id ?? `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        reps: s.reps ?? null,
        weight: s.weight ?? null,
        minReps: s.minReps ?? null,
        maxReps: s.maxReps ?? null,
        repsType: s.repsType ?? (s.minReps != null || s.maxReps != null ? "rep range" : "reps"),
        unit: s.unit ?? item.unit ?? "kg",
        isRangeReps: !!(s.minReps || s.maxReps),
        isCompleted: !!s.completed, // ExerciseBlock expects isCompleted
        setType: s.setType ?? "Normal",
        // keep any other fields as-is
        ...s,
      }));

      const exerciseProp = {
        id: item.id,
        exercise_name: item.exercise_name ?? item.name ?? "Exercise",
        exercise_type: item.exercise_type ?? null,
        equipment: item.equipment ?? "",
      };

      const dataProp = {
        notes: item.notes ?? "",
        restTimer: item.restTimer ?? 0,
        sets: mappedSets,
        unit: item.unit ?? "kg",
        repsType: item.repsType ?? "reps",
      };

      const onChange = (newData: any) => {
        // TODO: wire this to your workout state if you want edits to persist while logging.
        // e.g. updateExerciseSets?.(item.id, newData.sets)
        console.log("ExerciseBlock onChange (not persisted):", item.id, newData);
      };

 const handleToggleSetComplete = (_exerciseId: string, setIndex: number, _completed: boolean) => {
  const setId = mappedSets?.[setIndex]?.id;
  if (setId) {
    // toggleSetCompletion expects (exerciseId, setId) — call it
    toggleSetCompletion(item.id, setId);
  } else {
    console.warn("toggleSetComplete: setId not found for", item.id, setIndex);
  }
};

const handleDeleteExercise = async (exerciseId: string) => {
  try {
    await removeExercise(exerciseId);

    // 2) Update local state
    setExercisesData((prev: any[]) => {
      const next = prev.filter((e) => e.id !== exerciseId);

      if (next.length === 0) {
        navigation.navigate("HomeMain"); 
      }

      return next;
    });
  } catch (err) {
    console.error("handleDeleteExercise failed:", err);
  }
};



      return (
        <ExerciseBlock
          exercise={exerciseProp}
          data={dataProp}
          onChange={onChange}
          onOpenRepRange={(exerciseId: string, setIndex: number) => {
           
            console.log("open rep range", exerciseId, setIndex);
          }}
          showCheckIcon={true}
      onDeleteExercise={(exerciseId)=> handleDeleteExercise(exerciseId)}
          viewOnly={false}
          onOpenSetType={(exerciseId: string, setIndex?: number) => {
            // optional: implement if you want to change setType while logging
            console.log("open set type", exerciseId, setIndex);
          }}
          onOpenRepsType={(exerciseId: string) => {
            console.log("open reps type", exerciseId);
          }}
          onOpenRestTimer={(exerciseId: string) => {
            console.log("open rest timer", exerciseId);
          }}
           onToggleSetComplete={handleToggleSetComplete}
           
        />
      );
    },
    [toggleSetCompletion]
  );

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{routineTitle}</Text>
      </View>

      <WorkoutSummary completedSets={completedSets} totalSets={totalSets} totalVolume={totalVolume} duration={duration} />

      <FlatList
        data={exercisesData}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      <AppAlert
        visible={alertVisible}
        message={alertMessage}
        onHide={() => {
          setAlertVisible(false);
          if (navigateAfterAlert) {
            navigation.navigate("History");
            setNavigateAfterAlert(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#000000ff" },
  titleContainer: { marginBottom: 16 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
});
