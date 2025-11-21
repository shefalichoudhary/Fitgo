export const useRoutineHelpers = (setExercises: any) => {
  const updateExercise = (id: string, fn: (ex: any) => any) =>
    setExercises((prev:any) => prev.map((ex:any) => (ex.id === id ? fn(ex) : ex)))

  const addSet = (eid: string) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      sets: [...ex.sets, { id: Date.now().toString(), reps: "", weight: "", repsType: "reps", unit: "kg" }],
    }))

  const toggleUnit = (eid: string, sid: string) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      sets: ex.sets.map((s:any) => (s.id === sid ? { ...s, unit: s.unit === "kg" ? "lbs" : "kg" } : s)),
    }))

  const toggleRepsType = (eid: string, sid: string) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      sets: ex.sets.map((s:any) =>
        s.id === sid ? { ...s, repsType: s.repsType === "reps" ? "range" : "reps" } : s
      ),
    }))

  const updateSetField = (eid: string, sid: string, field: "reps" | "weight", val: string) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      sets: ex.sets.map((s:any) => (s.id === sid ? { ...s, [field]: val } : s)),
    }))
 const updateNote = (eid: string, text: string) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      note: text,
    }))

  // ✨ ➤ NEW: UPDATE REST TIMER
  const updateRestTimer = (eid: string, value?: number) =>
    updateExercise(eid, (ex) => ({
      ...ex,
      restTimer:
        typeof value === "number"
          ? value
          : ex.restTimer === 0
          ? 60
          : 0, // Default toggle: Off → 60s → Off
    }))

  return { updateExercise, addSet, toggleUnit, toggleRepsType, updateSetField, updateNote, updateRestTimer }
}
