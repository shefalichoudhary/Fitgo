import type { Unit, RepsType, Set } from "./types";

export const narrowUnit = (maybeUnit: any): Unit => (maybeUnit === "lbs" ? "lbs" : "kg");
export const narrowRepsType = (maybe: any): RepsType => (maybe === "rep range" ? "rep range" : "reps");

export const normalizeSet = (s?: Partial<Set>, dataUnit: Unit = "kg", dataRepsType: RepsType = "reps"): Set => ({
  weight: s?.weight ?? null,
  reps: s?.reps ?? null,
  minReps: s?.minReps ?? null,
  maxReps: s?.maxReps ?? null,
  duration: s?.duration ?? null,
  isRangeReps: s?.isRangeReps ?? false,
  previousWeight: s?.previousWeight ?? null,
  previousReps: s?.previousReps ?? null,
  previousMinReps: s?.previousMinReps ?? null,
  previousMaxReps: s?.previousMaxReps ?? null,
  previousUnit: s?.previousUnit,
  previousRepsType: s?.previousRepsType,
  previousDuration: s?.previousDuration ?? null,
  isCompleted: s?.isCompleted ?? false,
  setType: s?.setType ?? "Normal",
 unit: s?.unit ? narrowUnit(s.unit) : narrowUnit(dataUnit),
  repsType: s?.repsType ? narrowRepsType(s.repsType) : narrowRepsType(dataRepsType),
});
