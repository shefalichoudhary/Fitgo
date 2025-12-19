import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useWorkoutData } from "../../../hooks/useWorkoutData";
import { WorkoutSummary } from "@/components/logWorkout/WorkoutSummary";
import ExerciseBlock from "@/components/Routines/ExerciseBlock";
import { saveWorkoutSession } from "@/utils/workout";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/utils/user";
import { AppAlert } from "@/components/AppAlert";
import { useRoutineHelpers } from "@/components/Routines/useRoutineHelpers";
import RestTimer from "@/components/logWorkout/RestTimer";
import type { RestTimerHandle } from "@/components/logWorkout/RestTimer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { updateRoutineDefinition } from "@/utils/updateRoutineDefinition";
import { ConfirmModal } from "@/components/ConfirmModal";
import { mapExerciseToBlockProps } from "@/utils/mappers/mapExerciseToBlockProps";

export default function LogWorkoutScreen() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [navigateAfterAlert, setNavigateAfterAlert] = useState(false);
  const [saveConfirmVisible, setSaveConfirmVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routineId = route.params?.routineId;
  const {
    routineTitle,
    exercisesData,
    duration,
    setExercisesData,
    toggleSetCompletion,
    removeExercise,
  } = useWorkoutData(routineId);
  const [user, setUser] = useState<any>(null);
  const { toggleRepsType, updateRestTimer } = useRoutineHelpers(setExercisesData);

  const restTimerRef = React.useRef<RestTimerHandle | null>(null);

  useEffect(() => {
    (async () => {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    const MIN_SHOW_MS = 300;
    const FALLBACK_MS = 3000;

    let minTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const resolveIfReady = () => {
      // treat exercisesData as "ready" when defined (can be []), and user may be null if not logged in
      const dataReady = typeof exercisesData !== "undefined" && exercisesData !== null;
      const userReady = typeof user !== "undefined"; // user may be null but fetched
      if (dataReady && userReady && mounted) {
        // ensure overlay visible for at least MIN_SHOW_MS
        minTimer = setTimeout(() => {
          if (!mounted) return;
          setLoading(false);
        }, MIN_SHOW_MS);
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      }
    };

    // safety fallback to hide loader even if something goes wrong
    fallbackTimer = setTimeout(() => {
      if (!mounted) return;
      setLoading(false);
    }, FALLBACK_MS);

    resolveIfReady();

    return () => {
      mounted = false;
      if (minTimer) clearTimeout(minTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
    // watch the things that need to be ready
  }, [exercisesData, user]);

  const totalSets = exercisesData.reduce((a, e) => a + (e.sets?.length ?? 0), 0);
  const completedSets = exercisesData.reduce(
    (a, e) => a + (e.sets?.filter((s: any) => s.completed).length ?? 0),
    0
  );

  const totalVolume = exercisesData.reduce((total, exercise) => {
    const exerciseVolume =
      exercise.sets?.reduce((setTotal: number, s: any) => {
        const isCompleted = s.completed === true || s.isCompleted === true;
        if (!isCompleted) return setTotal;

        let reps = 0;

        // ✅ 1. Direct reps always win
        if (typeof s.reps === "number") {
          reps = s.reps;
        }
        // ✅ 2. Rep range detected by min/max presence
        else if (typeof s.maxReps === "number" || typeof s.minReps === "number") {
          reps = s.maxReps ?? s.minReps ?? 0;
        }

        return setTotal + reps * (s.weight ?? 0);
      }, 0) ?? 0;

    return total + exerciseVolume;
  }, 0);

  const handleSave = async () => {
    const anyCompleted = exercisesData.some((ex) => ex.sets.some((s) => s.completed === true));

    if (!anyCompleted) {
      setAlertMessage("Please complete at least one set before saving the workout.");
      setAlertVisible(true);
      return;
    }

    if (!user) {
      setAlertMessage("User not found. Please log in first.");
      setAlertVisible(true);
      return;
    }

    // show the confirm modal (left button => Save only, right => Save + update)
    setSaveConfirmVisible(true);
  };

  const performSave = async (saveAndUpdateRoutine: boolean) => {
    if (saving) return;
    setSaveConfirmVisible(false);
    setSaving(true);

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

      if (saveAndUpdateRoutine && routineId) {
        try {
          await updateRoutineDefinition(routineId, {
            title: routineTitle,
            exercises: exercisesData,
          });
        } catch (err) {
          console.warn("updateRoutineDefinition failed (non-fatal):", err);
        }
      }

      setAlertMessage("Workout Saved! Your workout has been added to History.");
      setNavigateAfterAlert(true);
      setAlertVisible(true);
    } catch (err) {
      console.error("saveWorkoutSession failed:", err);
      setAlertMessage("Failed to save workout. Please try again.");
      setAlertVisible(true);
    } finally {
      setSaving(false);
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
  }, [navigation, routineTitle, duration, totalSets, completedSets, totalVolume, user, handleSave]);

  // ---------- Helpers to adapt exerciseData -> ExerciseBlock props ----------
  const renderExercise = useCallback(
    ({ item }: { item: any }) => {
      const mappedSets = (item.sets || []).map((s: any, idx: number) => {
        // if id already contains the routineId prefix, keep it; otherwise generate one
        const existingId = typeof s.id === "string" ? s.id : "";
        const hasRoutinePrefix = routineId && existingId.startsWith(`${routineId}-`);
        const normalizedId = hasRoutinePrefix
          ? existingId
          : `${routineId ?? "session"}-${item.id}-set-${idx}-${existingId || String(Date.now()).slice(-6)}`;

        return {
          id: normalizedId,
          reps: s.reps ?? null,
          weight: s.weight ?? null,
          minReps: s.minReps ?? s.repsMin ?? null,
          maxReps: s.maxReps ?? s.repsMax ?? null,
          repsType: s.repsType ?? (s.minReps != null || s.maxReps != null ? "rep range" : "reps"),
          unit: s.unit ?? item.unit ?? "kg",
          isRangeReps: !!(s.minReps || s.maxReps),
          isCompleted: !!s.completed,
          setType: s.setType ?? "Normal",
        };
      });
      const { exercise, data } = mapExerciseToBlockProps({
        ...item,
        sets: mappedSets,
      });

      const onChange = (newData: any) => {
        setExercisesData((prev: any[]) =>
          prev.map((ex) =>
            ex.id === item.id
              ? {
                  ...ex,
                  notes: newData.notes,
                  restTimer: newData.restTimer,
                  unit: newData.unit,
                  repsType: newData.repsType,
                  sets: newData.sets.map((s: any) => ({
                    id: s.id,
                    reps: s.reps ?? null,
                    weight: s.weight ?? null,
                    minReps: s.minReps ?? s.repsMin ?? null,
                    maxReps: s.maxReps ?? s.repsMax ?? null,

                    repsType: s.repsType ?? newData.repsType,
                    unit: s.unit ?? newData.unit,
                    completed: !!s.isCompleted,
                    setType: s.setType ?? "Normal",
                  })),
                }
              : ex
          )
        );
      };

      const handleToggleSetComplete = (
        _exerciseId: string,
        setIndex: number,
        completed: boolean,
        restSeconds: number
      ) => {
        const setId = mappedSets?.[setIndex]?.id;
        if (!setId) return;

        toggleSetCompletion(_exerciseId, setId, completed);

        if (completed && restSeconds > 0) {
          setTimeout(() => {
            const owner = restTimerRef.current?.getState?.();
            if (owner?.exerciseId === _exerciseId && owner?.setId === setId) return;
            restTimerRef.current?.start?.(_exerciseId, setId, restSeconds);
          }, 0);
        } else {
          const owner = restTimerRef.current?.getState?.();
          if (owner?.exerciseId === _exerciseId && owner?.setId === setId) {
            restTimerRef.current?.stop?.();
          }
        }
      };

      const handleOpenRepsType = (exerciseId: string) => {
        const ex = exercisesData.find((e: any) => e.id === exerciseId);
        if (!ex) return;
        const next = ex.repsType === "reps" ? "rep range" : "reps";
        setExercisesData((prev: any[]) =>
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

      const handleOpenRepRange = (exerciseId: string, setIndex: number) => {
        const setId = mappedSets?.[setIndex]?.id;
        if (setId) {
          toggleRepsType(exerciseId, setId);
        }
      };

      const handleOpenRestTimer = (exerciseId: string) => {
        const ex = exercisesData.find((e: any) => e.id === exerciseId);
        const next = (ex?.restTimer ?? 0) === 0 ? 60 : 0;
        updateRestTimer(exerciseId, next);
      };

      const handleDeleteExercise = async (exerciseId: string) => {
        try {
          await removeExercise(exerciseId);
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
          exercise={exercise}
          data={data}
          onChange={onChange}
          onOpenRepRange={(exerciseId, setIndex) => handleOpenRepRange(exerciseId, setIndex)}
          showCheckIcon={true}
          onDeleteExercise={handleDeleteExercise}
          viewOnly={false}
          onOpenSetType={(exerciseId: string, setIndex?: number) => {
            console.log("open set type", exerciseId, setIndex);
          }}
          onOpenRepsType={(exerciseId) => handleOpenRepsType(exerciseId)}
          onOpenRestTimer={(exerciseId: string) => handleOpenRestTimer(exerciseId)}
          onToggleSetComplete={(exerciseId, setIndex, completed) =>
            handleToggleSetComplete(exerciseId, setIndex, completed, item.restTimer ?? 0)
          }
        />
      );
    },
    [
      toggleSetCompletion,
      setExercisesData,
      removeExercise,
      navigation,
      toggleRepsType,
      updateRestTimer,
      exercisesData,
    ]
  );

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading workout..." />;
  }
  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{routineTitle}</Text>
      </View>
      <RestTimer
        ref={restTimerRef}
        resolveLabel={(exerciseId) => {
          const ex = exercisesData.find((e) => e.id === exerciseId);
          return ex ? (ex.exercise_name ?? ex.name ?? "Rest") : "Rest";
        }}
        onChange={(s) => {}}
        onFinish={(exerciseId, setId) => {}}
      />
      <WorkoutSummary
        completedSets={completedSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        duration={duration}
      />

      <FlatList
        data={exercisesData}
        keyExtractor={(item) => `${routineId ?? "session"}-${item.id}`}
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

      <ConfirmModal
        visible={saveConfirmVisible}
        title="Save workout?"
        message="Would you like to save this workout session? You can also choose to update your routine with today's changes."
        onCancel={() => setSaveConfirmVisible(false)} // not shown because hideCancel
        onConfirm={() => performSave(false)} // primary (bottom)
        confirmText="Save Workout"
        onSecondary={() => performSave(true)} // secondary (top)
        secondaryText="Save & Update Routine"
        hideCancel={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#000000ff" },
  titleContainer: { marginBottom: 16 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
});
