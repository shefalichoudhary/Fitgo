CREATE TABLE "exercise_muscles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"muscle_id" uuid NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_name" text NOT NULL,
	"exercise_type" text,
	"equipment" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" text DEFAULT CURRENT_TIMESTAMP,
	"weight" real,
	"body_fat" real,
	"muscle_mass" real,
	"waist" real,
	"chest" real,
	"shoulders" real,
	"neck" real,
	"hips" real,
	"left_arm" real,
	"right_arm" real,
	"left_thigh" real,
	"right_thigh" real,
	"left_calf" real,
	"right_calf" real
);
--> statement-breakpoint
CREATE TABLE "muscles_targeted" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"notes" text,
	"unit" text DEFAULT 'kg' NOT NULL,
	"reps_type" text DEFAULT 'reps' NOT NULL,
	"rest_timer" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "routine_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"weight" integer NOT NULL,
	"reps" integer DEFAULT 0,
	"min_reps" integer DEFAULT 0,
	"max_reps" integer DEFAULT 0,
	"duration" integer DEFAULT 0,
	"set_type" text DEFAULT 'Normal' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	"is_pre_made" integer DEFAULT 0,
	"level" text DEFAULT 'beginner',
	"description" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "seed_meta" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_routine_workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"routine_id" uuid,
	"workout_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text DEFAULT 'Guest' NOT NULL,
	"email" text DEFAULT 'guest@example.com' NOT NULL,
	"password" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT 'Productive. Passionate. Progress-driven. Always learning.' NOT NULL,
	"google" integer DEFAULT 0,
	"photo" text DEFAULT '',
	"fitness_goal" text DEFAULT 'lose fat' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"notes" text,
	"unit" text DEFAULT 'kg' NOT NULL,
	"reps_type" text DEFAULT 'reps' NOT NULL,
	"rest_timer" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"weight" integer NOT NULL,
	"min_reps" integer,
	"max_reps" integer,
	"previous_weight" integer,
	"previous_duration" integer,
	"previous_reps" integer,
	"previous_min_reps" integer,
	"previous_max_reps" integer,
	"previous_unit" text,
	"previous_reps_type" text,
	"reps" integer DEFAULT 0,
	"duration" integer DEFAULT 0,
	"set_type" text DEFAULT 'Normal' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid,
	"date" text NOT NULL,
	"title" text NOT NULL,
	"duration" integer NOT NULL,
	"volume" integer NOT NULL,
	"sets" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_muscle_id_muscles_targeted_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscles_targeted"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_sets" ADD CONSTRAINT "routine_sets_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_sets" ADD CONSTRAINT "routine_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_routine_workout" ADD CONSTRAINT "user_routine_workout_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_routine_workout" ADD CONSTRAINT "user_routine_workout_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_routine_workout" ADD CONSTRAINT "user_routine_workout_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;