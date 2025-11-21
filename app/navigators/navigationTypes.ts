import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Measurement } from "../../types/Measurement"

// Demo Tab Navigator types
export type DemoTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>
  History: NavigatorScreenParams<HistoryStackParamList>
  Profile: NavigatorScreenParams<ProfileStackParamList>
    Exercises: NavigatorScreenParams<ExercisesStackParamList>
}
export type HomeStackParamList = {
  HomeMain: undefined;
  Routines: undefined;
  RoutineDetails: { id: string }; 
CreateRoutine: {
    selectedExercises?: {
      id: string;
      name: string;
        restTimer?: number | null  ;
      sets: { reps: number; weight?: number; id: string }[];
      muscleGroup?: string;
    }[];
  };
  PreMadeRoutines: undefined;
  Measurements: undefined;
  Exercises: { alreadyAdded?: string[] };
AddMeasurement: {
  editData?: Measurement;
};
  LogWorkout: {routineId:string}

}

// Stack for History Tab
export type HistoryStackParamList = {
  History: undefined;
   WorkoutDetails: { id: string }; 
}

// Stack for Profile Tab
export type ProfileStackParamList = {
  Profile: undefined;
}
export type ExercisesStackParamList = {
Exercises: { alreadyAdded?: string[] };
}
// App Stack Navigator types
export type AppStackParamList = {
  Demo: NavigatorScreenParams<DemoTabParamList>
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}
