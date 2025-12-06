import { useCallback } from "react";


export const useRoutineHelpers = (setExercises: (fn: any) => void) => {
  // Small helper to update a single exercise by id
  const updateExercise = useCallback(
    (id: string, fn: (ex: any) => any) =>
      setExercises((prev: any[]) => prev.map((ex) => (ex.id === id ? fn(ex) : ex))),
    [setExercises]
  );

  // Add a new empty set to an exercise
  const addSet = useCallback(
    (eid: string) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        sets: [
          ...(ex.sets || []),
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            reps: null,
            weight: null,
            duration: null,
            repsType: "reps",
            unit: "kg",
            isCompleted: false,
            setType: "Normal",
          },
        ],
      })),
    [updateExercise]
  );

  // Toggle unit for a single set
  const toggleUnit = useCallback(
    (eid: string, sid: string) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        sets: (ex.sets || []).map((s: any) =>
          s.id === sid ? { ...s, unit: s.unit === "kg" ? "lbs" : "kg" } : s
        ),
      })),
    [updateExercise]
  );

  // Toggle repsType for a single set (keeps "rep range" wording consistent)
  const toggleRepsType = useCallback(
    (eid: string, sid: string) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        sets: (ex.sets || []).map((s: any) =>
          s.id === sid
            ? { ...s, repsType: s.repsType === "reps" ? "rep range" : "reps" }
            : s
        ),
      })),
    [updateExercise]
  );

  // update arbitrary set field
  const updateSetField = useCallback(
    (eid: string, sid: string, field: string, val: any) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        sets: (ex.sets || []).map((s: any) => (s.id === sid ? { ...s, [field]: val } : s)),
      })),
    [updateExercise]
  );

  // update exercise-level note(s)
  const updateNote = useCallback(
    (eid: string, text: string) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        notes: text,
      })),
    [updateExercise]
  );

  // toggle or set rest timer for exercise
  const updateRestTimer = useCallback(
    (eid: string, value?: number) =>
      updateExercise(eid, (ex: any) => ({
        ...ex,
        restTimer:
          typeof value === "number" ? value : ex.restTimer && ex.restTimer > 0 ? 0 : 60,
      })),
    [updateExercise]
  );

  return {
    updateExercise,
    addSet,
    toggleUnit,
    toggleRepsType,
    updateSetField,
    updateNote,
    updateRestTimer,
  };
};

export default useRoutineHelpers;
