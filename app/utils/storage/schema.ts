import { sqliteTable, text, integer,real  } from "drizzle-orm/sqlite-core";
import { InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import cuid from "cuid";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text("username").default("Guest").notNull(),
  email: text("email").default("guest@example.com").notNull(),
  password: text("password").default("").notNull(),
  google: integer("google").default(0), // 0 = normal/guest user, 1 = Google user
  photo: text("photo").default(""),
  fitness_goal: text("fitness_goal").default("lose fat").notNull(),
  created_at: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const exercises = sqliteTable("exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  exercise_name: text("exercise_name").notNull(),
  exercise_type: text("exercise_type"),
  equipment: text("equipment").notNull(),
  type: text("type").notNull(),
});

export const muscles = sqliteTable("muscles_targeted", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull(),
});

export const exerciseMuscles = sqliteTable("exercise_muscles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  exercise_id: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  muscle_id: text("muscle_id")
    .notNull()
    .references(() => muscles.id),
  role: text("role").notNull(),
});
export const measurements = sqliteTable("measurements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  date: text("date").$defaultFn(() => new Date().toISOString()),
  weight: real("weight"),
  bodyFat: real("body_fat"),
  muscleMass: real("muscle_mass"),
  waist: real("waist"),
  chest: real("chest"),
  shoulders: real("shoulders"),
  neck: real("neck"),
  hips: real("hips"),
  leftArm: real("left_arm"),
  rightArm: real("right_arm"),
  leftThigh: real("left_thigh"),
  rightThigh: real("right_thigh"),
  leftCalf: real("left_calf"),
  rightCalf: real("right_calf"),
})
export const routines = sqliteTable("routines", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull(),
  createdBy: text("created_by"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
   isPreMade: integer("is_pre_made").default(0),
     level: text("level").default("beginner"),
       description: text("description").default(""),
});

export const routineExercises = sqliteTable("routine_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id),
  exerciseId: text("exercise_id").notNull(), // foreign key to your exercises table
  notes: text("notes"),
  unit: text("unit").$type<"lbs" | "kg">().notNull().default("kg"),
  repsType: text("reps_type").$type<"reps" | "rep range">().notNull().default("reps"),
  restTimer: integer("rest_timer").default(0),
});

export const routineSets = sqliteTable("routine_sets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  weight: integer("weight").notNull(),
  reps: integer("reps").default(0),
  minReps: integer("min_reps").default(0),
  maxReps: integer("max_reps").default(0),
  duration: integer("duration").default(0),
  setType: text("set_type").$type<"W" | "Normal" | "D" | "F">().notNull().default("Normal"),
  // 🕒 rest time per set
});

export const workouts = sqliteTable("workouts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  routineId: text("routineId"),
  date: text("date").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  volume: integer("volume").notNull(),
  sets: integer("sets").notNull(),
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id),
  exerciseId: text("exercise_id").notNull(), // foreign key to your exercises table
  notes: text("notes"),
  unit: text("unit").$type<"lbs" | "kg">().notNull().default("kg"),
  repsType: text("reps_type").$type<"reps" | "rep range">().notNull().default("reps"),
  restTimer: integer("rest_timer").default(0),
});

export const workoutSets = sqliteTable("workout_sets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  weight: integer("weight").notNull(),
  minReps: integer("min_reps"),
  maxReps: integer("max_reps"),
  previousWeight: integer("previous_weight"),
  previousDuration: integer("previous_duration"),
  previousReps: integer("previous_reps"),
  previousMinReps: integer("previous_min_reps"),
  previousMaxReps: integer("previous_max_reps"),
  previousUnit: text("previous_unit").$type<"lbs" | "kg">(),
  previousRepsType: text("previous_reps_type").$type<"reps" | "rep range">(),
  reps: integer("reps").default(0),
  duration: integer("duration").default(0),
  setType: text("set_type").$type<"W" | "Normal" | "D" | "F">().notNull().default("Normal"),
});

export const userRoutineWorkout = sqliteTable("user_routine_workout", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  routineId: text("routine_id").references(() => routines.id),
  workoutId: text("workout_id").references(() => workouts.id),
});

// Types
export type Exercise = InferSelectModel<typeof exercises>;
export type Muscle = InferSelectModel<typeof muscles>;
export type ExerciseMuscle = InferSelectModel<typeof exerciseMuscles>;
export type Routine = InferSelectModel<typeof routines>;
export type RoutineExercise = InferSelectModel<typeof routineExercises>;
export type RoutineSet = InferSelectModel<typeof routineSets>;
export type Workout = InferSelectModel<typeof workouts>;
export type WorkoutSet = InferSelectModel<typeof workoutSets>;
export type User = InferSelectModel<typeof users>;
