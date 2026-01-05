CREATE TABLE `destinations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`region` text NOT NULL,
	`province` text,
	`category` text NOT NULL,
	`mood_tags` text,
	`short_desc` text,
	`long_desc` text,
	`thumbnail` text,
	`cover_image` text,
	`audio_url` text,
	`detail_json` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `destinations_slug_unique` ON `destinations` (`slug`);