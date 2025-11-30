export type Unit = "kg" | "lbs";
export type RepsType = "reps" | "rep range";

export type Set = {
  id?: string;
  weight?: number | null;
  reps?: number | null;
  minReps?: number | null;
  maxReps?: number | null;
  duration?: number | null;
  isRangeReps?: boolean;
  previousWeight?: number | null;
  previousReps?: number | null;
  previousMinReps?: number | null;
  previousMaxReps?: number | null;
  previousUnit?: Unit;
  previousRepsType?: RepsType;
  previousDuration?: number | null;
  isCompleted?: boolean;
  setType?: "W" | "Normal" | "D" | "F" | string;
  unit?: Unit;
  repsType?: RepsType;
};

export type Exercise = {
  id: string;
  exercise_name: string;
  exercise_type?: string | null;
  equipment?: string;
};

export type DataShape = {
  notes: string;
  restTimer: number;
  sets: Set[];
  unit: Unit;
  repsType: RepsType;
};
