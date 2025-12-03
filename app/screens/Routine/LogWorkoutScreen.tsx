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
import { Vibration } from "react-native";
import RestTimer from "@/components/logWorkout/RestTimer";

export default function LogWorkoutScreen() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [navigateAfterAlert, setNavigateAfterAlert] = useState(false);
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
  const [activeRestTimer, setActiveRestTimer] = useState<{
    exerciseId: string | null;
    setId?: string | null;
    remaining: number;
    running: boolean;
  }>({ exerciseId: null, setId: null, remaining: 0, running: false });
  const timerRef = React.useRef<number | null>(null);

  // guard ref stores ids that the interval is currently owning (prevents accidental overlaps)
  const activeTimerOwnerRef = React.useRef<{ exerciseId: string | null; setId: string | null }>({
    exerciseId: null,
    setId: null,
  });

  const clearExistingInterval = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeTimerOwnerRef.current = { exerciseId: null, setId: null };
  };

  useEffect(() => {
    (async () => {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
    })();
  }, []);

  const startRestTimerForExercise = (exerciseId: string, setId: string, initialSeconds: number) => {
    // clear any existing interval first
    clearExistingInterval();
    // set owner so subsequent calls know which timer is active
    activeTimerOwnerRef.current = { exerciseId, setId };
    // set active timer state (start running)
    setActiveRestTimer({ exerciseId, setId, remaining: initialSeconds, running: true });
    timerRef.current = setInterval(() => {
      setActiveRestTimer((prev) => {
        if (!prev) return prev;
        const owner = activeTimerOwnerRef.current;
        if (owner.exerciseId !== prev.exerciseId || owner.setId !== (prev.setId ?? null)) {
          // clear ourselves
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }

        if (!prev.running) return prev;

        if (prev.remaining <= 1) {
          Vibration.vibrate(500);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          activeTimerOwnerRef.current = { exerciseId: null, setId: null };
          return { exerciseId: null, setId: null, remaining: 0, running: false };
        }

        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000) as unknown as number;
  };

  const pauseRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveRestTimer((p: any) => (p ? { ...p, running: false } : p));
  };

  const resumeRestTimer = () => {
    setActiveRestTimer((prev: any) => {
      if (!prev) return prev;
      if (prev.remaining <= 0) return { ...prev, running: false };
      if (timerRef.current) {
        return { ...prev, running: true };
      }

      const newState = { ...prev, running: true };
      timerRef.current = setInterval(() => {
        setActiveRestTimer((p) => {
          if (!p) return p;

          // guard: if owner doesn't match, stop
          const owner = activeTimerOwnerRef.current;
          if (owner.exerciseId !== p.exerciseId || owner.setId !== (p.setId ?? null)) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return p;
          }

          if (!p.running) return p;

          if (p.remaining <= 1) {
            Vibration.vibrate(500);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            activeTimerOwnerRef.current = { exerciseId: null, setId: null };
            return { exerciseId: null, setId: null, remaining: 0, running: false };
          }
          return { ...p, remaining: p.remaining - 1 };
        });
      }, 1000) as unknown as number;

      return newState;
    });
  };

  const stopRestTimer = () => {
    clearExistingInterval();
    setActiveRestTimer({ exerciseId: null, setId: null, remaining: 0, running: false });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      activeTimerOwnerRef.current = { exerciseId: null, setId: null };
    };
  }, []);

  const totalSets = exercisesData.reduce((a, e) => a + (e.sets?.length ?? 0), 0);
  const completedSets = exercisesData.reduce(
    (a, e) => a + (e.sets?.filter((s: any) => s.completed).length ?? 0),
    0
  );
  const totalVolume = exercisesData.reduce(
    (a, e) =>
      a +
      (e.sets?.reduce(
        (v: number, s: any) => v + (s.completed ? (s.reps ?? 0) * (s.weight ?? 0) : 0),
        0
      ) ?? 0),
    0
  );

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
  const renderExercise = useCallback(
    ({ item }: { item: any }) => {
      const mappedSets = (item.sets || []).map((s: any, idx: number) => ({
        id: s.id ?? `${item.id}-set-${idx}`,
        reps: s.reps ?? null,
        weight: s.weight ?? null,
        minReps: s.minReps ?? null,
        maxReps: s.maxReps ?? null,
        repsType: s.repsType ?? (s.minReps != null || s.maxReps != null ? "rep range" : "reps"),
        unit: s.unit ?? item.unit ?? "kg",
        isRangeReps: !!(s.minReps || s.maxReps),
        isCompleted: !!s.completed,
        setType: s.setType ?? "Normal",
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

      // Persist changes coming from ExerciseBlock (sets/unit/repsType/notes/restTimer)
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
                    minReps: s.minReps ?? null,
                    maxReps: s.maxReps ?? null,
                    repsType: s.repsType ?? "reps",
                    unit: s.unit ?? newData.unit,
                    completed: !!s.isCompleted,
                    setType: s.setType ?? "Normal",
                    ...s,
                  })),
                }
              : ex
          )
        );
      };

      // new signature includes restSeconds so we don't read exercisesData (avoids stale reads)
      const handleToggleSetComplete = (
        _exerciseId: string,
        setIndex: number,
        completed: boolean,
        restSeconds: number
      ) => {
        const setId = mappedSets?.[setIndex]?.id;
        if (!setId) return;

        if (typeof clearExistingInterval === "function") {
          clearExistingInterval();
        } else if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          activeTimerOwnerRef.current = { exerciseId: null, setId: null };
        }

        toggleSetCompletion(_exerciseId, setId, completed);

        if (completed && restSeconds > 0) {
          // schedule the start after the current stack/microtask so re-render from toggleSetCompletion applies
          setTimeout(() => {
            // extra guard: ensure activeTimerOwnerRef isn't already the same owner
            const currentOwner = activeTimerOwnerRef.current;
            if (currentOwner.exerciseId === _exerciseId && currentOwner.setId === setId) {
              // already running for this owner — do nothing
              return;
            }
            startRestTimerForExercise(_exerciseId, setId, restSeconds);
          }, 0);
        } else {
          const owner = activeTimerOwnerRef.current;
          if (owner.exerciseId === _exerciseId && owner.setId === setId) {
            stopRestTimer();
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
          exercise={exerciseProp}
          data={dataProp}
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
      activeRestTimer,
      startRestTimerForExercise,
      stopRestTimer,
    ]
  );

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{routineTitle}</Text>
      </View>
      <RestTimer
        activeRestTimer={activeRestTimer}
        onPause={pauseRestTimer}
        onResume={resumeRestTimer}
        onStop={stopRestTimer}
        label={(() => {
          const ex = exercisesData.find((e) => e.id === activeRestTimer.exerciseId);
          return ex ? (ex.exercise_name ?? ex.name ?? "Rest") : "Rest";
        })()}
      />
      <WorkoutSummary
        completedSets={completedSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        duration={duration}
      />

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
