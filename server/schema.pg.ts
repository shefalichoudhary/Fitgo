// import {
//   pgTable,
//   text,
//   integer,
//   real,
//   uuid,
// } from "drizzle-orm/pg-core";  
// import { InferSelectModel, sql } from "drizzle-orm";
                                                                                                                   
// /* ================= SEED META ================= */

// export const seedMeta = pgTable("seed_meta", {
//   key: text("key").primaryKey(),
//   value: text("value").notNull(),
// });

// /* ================= USERS ================= */

// export const users = pgTable("users", {
// id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   username: text("username").notNull().default("Guest"),
//   email: text("email").notNull().default("guest@example.com"),
//   password: text("password").notNull().default(""),
//   bio: text("bio")
//     .notNull()
//     .default("Productive. Passionate. Progress-driven. Always learning."),
//   google: integer("google").default(0),
//   photo: text("photo").default(""),
//   fitness_goal: text("fitness_goal").notNull().default("lose fat"),
//   created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
// });

// /* ================= EXERCISES ================= */

// export const exercises = pgTable("exercises", {
//  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   exercise_name: text("exercise_name").notNull(),
//   exercise_type: text("exercise_type"),
//   equipment: text("equipment").notNull(),
//   type: text("type").notNull(),
// });

// /* ================= MUSCLES ================= */

// export const muscles = pgTable("muscles_targeted", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull(),
// });

// export const exerciseMuscles = pgTable("exercise_muscles", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   exercise_id: uuid("exercise_id")
//     .notNull()
//     .references(() => exercises.id, { onDelete: "cascade" }),
//   muscle_id: uuid("muscle_id")
//     .notNull()
//     .references(() => muscles.id, { onDelete: "cascade" }),
//   role: text("role").notNull(),
// });

// /* ================= MEASUREMENTS ================= */

// export const measurements = pgTable("measurements", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   userId: uuid("user_id")
//     .notNull()
//     .references(() => users.id, { onDelete: "cascade" }),
//   date: text("date").default(sql`CURRENT_TIMESTAMP`),
//   weight: real("weight"),
//   bodyFat: real("body_fat"),
//   muscleMass: real("muscle_mass"),
//   waist: real("waist"),
//   chest: real("chest"),
//   shoulders: real("shoulders"),
//   neck: real("neck"),
//   hips: real("hips"),
//   leftArm: real("left_arm"),
//   rightArm: real("right_arm"),
//   leftThigh: real("left_thigh"),
//   rightThigh: real("right_thigh"),
//   leftCalf: real("left_calf"),
//   rightCalf: real("right_calf"),
// });

// /* ================= ROUTINES ================= */

// export const routines = pgTable("routines", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull(),
//   createdBy: uuid("created_by"),
//   createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
//   isPreMade: integer("is_pre_made").default(0),
//   level: text("level").default("beginner"),
//   description: text("description").default(""),
// });

// /* ================= ROUTINE EXERCISES ================= */

// export const routineExercises = pgTable("routine_exercises", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   routineId: uuid("routine_id")
//     .notNull()
//     .references(() => routines.id, { onDelete: "cascade" }),
//   exerciseId: uuid("exercise_id").notNull(),
//   notes: text("notes"),
//   unit: text("unit").$type<"lbs" | "kg">().notNull().default("kg"),
//   repsType: text("reps_type")
//     .$type<"reps" | "rep range">()
//     .notNull()
//     .default("reps"),
//   restTimer: integer("rest_timer").default(0),
// });

// /* ================= ROUTINE SETS ================= */

// export const routineSets = pgTable("routine_sets", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   routineId: uuid("routine_id")
//     .notNull()
//     .references(() => routines.id, { onDelete: "cascade" }),
//   exerciseId: uuid("exercise_id")
//     .notNull()
//     .references(() => exercises.id, { onDelete: "cascade" }),
//   weight: integer("weight").notNull(),
//   reps: integer("reps").default(0),
//   minReps: integer("min_reps").default(0),
//   maxReps: integer("max_reps").default(0),
//   duration: integer("duration").default(0),
//   setType: text("set_type")
//     .$type<"W" | "Normal" | "D" | "F">()
//     .notNull()
//     .default("Normal"),
// });

// /* ================= WORKOUTS ================= */

// export const workouts = pgTable("workouts", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   routineId: uuid("routine_id"),
//   date: text("date").notNull(),
//   title: text("title").notNull(),
//   duration: integer("duration").notNull(),
//   volume: integer("volume").notNull(),
//   sets: integer("sets").notNull(),
// });

// /* ================= WORKOUT EXERCISES ================= */

// export const workoutExercises = pgTable("workout_exercises", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   workoutId: uuid("workout_id")
//     .notNull()
//     .references(() => workouts.id, { onDelete: "cascade" }),
//   exerciseId: uuid("exercise_id").notNull(),
//   notes: text("notes"),
//   unit: text("unit").$type<"lbs" | "kg">().notNull().default("kg"),
//   repsType: text("reps_type")
//     .$type<"reps" | "rep range">()
//     .notNull()
//     .default("reps"),
//   restTimer: integer("rest_timer").default(0),
// });

// /* ================= WORKOUT SETS ================= */

// export const workoutSets = pgTable("workout_sets", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   workoutId: uuid("workout_id")
//     .notNull()
//     .references(() => workouts.id, { onDelete: "cascade" }),
//   exerciseId: uuid("exercise_id")
//     .notNull()
//     .references(() => exercises.id),
//   weight: integer("weight").notNull(),
//   minReps: integer("min_reps"),
//   maxReps: integer("max_reps"),
//   previousWeight: integer("previous_weight"),
//   previousDuration: integer("previous_duration"),
//   previousReps: integer("previous_reps"),
//   previousMinReps: integer("previous_min_reps"),
//   previousMaxReps: integer("previous_max_reps"),
//   previousUnit: text("previous_unit").$type<"lbs" | "kg">(),
//   previousRepsType: text("previous_reps_type").$type<"reps" | "rep range">(),
//   reps: integer("reps").default(0),
//   duration: integer("duration").default(0),
//   setType: text("set_type")
//     .$type<"W" | "Normal" | "D" | "F">()
//     .notNull()
//     .default("Normal"),
// });

// /* ================= USER ROUTINE WORKOUT ================= */

// export const userRoutineWorkout = pgTable("user_routine_workout", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   userId: uuid("user_id")
//     .notNull()
//     .references(() => users.id, { onDelete: "cascade" }),
//   routineId: uuid("routine_id").references(() => routines.id),
//   workoutId: uuid("workout_id").references(() => workouts.id),
// });

// /* ================= TYPES ================= */

// export type User = InferSelectModel<typeof users>;
// export type Exercise = InferSelectModel<typeof exercises>;
// export type Muscle = InferSelectModel<typeof muscles>;
// export type ExerciseMuscle = InferSelectModel<typeof exerciseMuscles>;
// export type Routine = InferSelectModel<typeof routines>;
// export type RoutineExercise = InferSelectModel<typeof routineExercises>;
// export type RoutineSet = InferSelectModel<typeof routineSets>;
// export type Workout = InferSelectModel<typeof workouts>;
// export type WorkoutSet = InferSelectModel<typeof workoutSets>;
