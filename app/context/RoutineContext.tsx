import React, { createContext, useState, useContext } from "react";

type Routine = {
  id: string;
  title: string;
  exercises: any[];
};

type RoutineContextType = {
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
};

const RoutineContext = createContext<RoutineContextType | null>(null);

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  return (
    <RoutineContext.Provider value={{ routines, addRoutine }}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error("useRoutine must be used within a RoutineProvider");
  }
  return context;
};
