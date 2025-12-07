PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text DEFAULT 'Guest' NOT NULL,
	`email` text DEFAULT 'guest@example.com' NOT NULL,
	`password` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT 'Productive. Passionate. Progress-driven. Always learning.' NOT NULL,
	`google` integer DEFAULT 0,
	`photo` text DEFAULT '',
	`fitness_goal` text DEFAULT 'lose fat' NOT NULL,
	`created_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "password", "bio", "google", "photo", "fitness_goal", "created_at") SELECT "id", "username", "email", "password", "bio", "google", "photo", "fitness_goal", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;