import React, { createContext, useContext, useRef, useState } from "react";

type WorkoutSessionContextType = {
  hasUnsavedWorkout: boolean;
  setHasUnsavedWorkout: (v: boolean) => void;
  pendingNavigation: any;
  setPendingNavigation: (v: any) => void;
  routineId: string | null;
  setRoutineId: (v: string | null) => void;
};

const WorkoutSessionContext = createContext<WorkoutSessionContextType | null>(null);

export const WorkoutSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasUnsavedWorkout, setHasUnsavedWorkout] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<any>(null);
  const [routineId, setRoutineId] = useState<string | null>(null);

  return (
    <WorkoutSessionContext.Provider
      value={{
        hasUnsavedWorkout,
        setHasUnsavedWorkout,
        pendingNavigation,
        setPendingNavigation,
        routineId,
        setRoutineId,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
};

export const useWorkoutSession = () => {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx) throw new Error("useWorkoutSession must be used inside provider");
  return ctx;
};
