import { AntDesign } from "@expo/vector-icons";
import { SetRow} from "./SetRow";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

type Set = {
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
  previousUnit?: "kg" | "lbs";
  previousRepsType?: "reps" | "rep range";
  previousDuration?: number | null;
  isCompleted?: boolean;
  setType?: "W" | "Normal" | "D" | "F" | string;
  unit?: "kg" | "lbs";
  repsType?: "reps" | "rep range";
};

type Props = {
  exercise: {
    id: string;
    exercise_name: string;
    exercise_type: string | null;
    equipment: string;
  };
  data: {
    notes: string;
    restTimer: number;
    sets: Set[];
    unit: "lbs" | "kg";
    repsType: "reps" | "rep range";
  };
  onChange: (newData: {
    notes: string;
    restTime?: number;
    sets: Set[];
    unit: "lbs" | "kg";
    repsType: "reps" | "rep range";
  }) => void;
  onStartTimer?: () => void;
  onOpenRepRange: (exerciseId: string, setIndex: number) => void;
  showCheckIcon?: boolean;
  viewOnly?: boolean;
  onOpenWeight?: (exerciseId: string) => void;
  onOpenSetType: (exerciseId: string, setIndex?: number) => void;
  onOpenRepsType?: (exerciseId: string) => void;
  onOpenRestTimer: (exerciseId: string) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, completed: boolean) => void;
};

export default function ExerciseBlock({
  data,
  onChange,
  
}: Props) {
  // Temporary hardcoded exercise types for testing
  const isWeighted = true;    // Force weighted exercise
  const isBodyweight = false; // Disable bodyweight
  const isDuration = false;   // Disable duration

  const handleSetChange = <T extends keyof Set>(index: number, key: T, value: Set[T]) => {
    const updatedSets = [...data.sets];
    updatedSets[index] = { ...updatedSets[index], [key]: value };
    onChange({ ...data, sets: updatedSets });
  };

  const [visibleSets, setVisibleSets] = useState(data.sets.length > 0 ? data.sets.length : 1);

  const handleAddSet = () => {
    if (visibleSets < data.sets.length) {
      setVisibleSets((prev) => prev + 1);
      return;
    }

    // ... rest of your handleAddSet logic ...
  };

  // ... rest of your component JSX ...
}
