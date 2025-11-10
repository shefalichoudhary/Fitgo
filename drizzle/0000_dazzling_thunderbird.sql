CREATE TABLE `exercise_muscles` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`muscle_id` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`muscle_id`) REFERENCES `muscles_targeted`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_name` text NOT NULL,
	`exercise_type` text,
	`equipment` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muscles_targeted` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`notes` text,
	`unit` text DEFAULT 'kg' NOT NULL,
	`reps_type` text DEFAULT 'reps' NOT NULL,
	`rest_timer` integer DEFAULT 0,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`weight` integer NOT NULL,
	`reps` integer DEFAULT 0,
	`min_reps` integer DEFAULT 0,
	`max_reps` integer DEFAULT 0,
	`duration` integer DEFAULT 0,
	`set_type` text DEFAULT 'Normal' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_routine_workout` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`routine_id` text,
	`workout_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text DEFAULT 'Guest' NOT NULL,
	`email` text DEFAULT 'guest@example.com' NOT NULL,
	`password` text DEFAULT '' NOT NULL,
	`google` integer DEFAULT 0,
	`photo` text DEFAULT '',
	`fitness_goal` text DEFAULT 'lose fat' NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`notes` text,
	`unit` text DEFAULT 'kg' NOT NULL,
	`reps_type` text DEFAULT 'reps' NOT NULL,
	`rest_timer` integer DEFAULT 0,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`weight` integer NOT NULL,
	`min_reps` integer,
	`max_reps` integer,
	`previous_weight` integer,
	`previous_duration` integer,
	`previous_reps` integer,
	`previous_min_reps` integer,
	`previous_max_reps` integer,
	`previous_unit` text,
	`previous_reps_type` text,
	`reps` integer DEFAULT 0,
	`duration` integer DEFAULT 0,
	`set_type` text DEFAULT 'Normal' NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`routineId` text,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`duration` integer NOT NULL,
	`volume` integer NOT NULL,
	`sets` integer NOT NULL
);
