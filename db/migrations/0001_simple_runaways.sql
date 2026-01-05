CREATE TABLE `destination_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`destination_id` integer NOT NULL,
	`language_code` text NOT NULL,
	`title` text NOT NULL,
	`province` text,
	`mood_tags` text,
	`short_desc` text,
	`long_desc` text,
	`audio_url` text,
	`detail_json` text,
	FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dest_lang_idx` ON `destination_translations` (`destination_id`,`language_code`);--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `province`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `mood_tags`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `short_desc`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `long_desc`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `audio_url`;--> statement-breakpoint
ALTER TABLE `destinations` DROP COLUMN `detail_json`;