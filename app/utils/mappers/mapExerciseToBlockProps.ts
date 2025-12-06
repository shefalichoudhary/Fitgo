// src/utils/mappers/mapExerciseToBlockProps.ts

export function mapExerciseToBlockProps(item: any) {
  return {
    exercise: {
      id: item.id,
      exercise_name: item.exercise_name ?? item.name ?? "Exercise",
      exercise_type: item.exercise_type ?? item.type ?? null,
      equipment: item.equipment ?? "",
    },

    data: {
      notes: item.notes ?? "",
      restTimer: item.restTimer ?? 0,
      sets: item.sets ?? [],
      unit: item.unit ?? "kg",
      repsType: item.repsType ?? "reps",
    },
  };
}
