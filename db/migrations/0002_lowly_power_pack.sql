ALTER TABLE `destinations` ADD `province` text;--> statement-breakpoint
ALTER TABLE `destinations` ADD `mood_tags` text;--> statement-breakpoint
ALTER TABLE `destinations` ADD `audio_url` text;--> statement-breakpoint
ALTER TABLE `destination_translations` DROP COLUMN `province`;--> statement-breakpoint
ALTER TABLE `destination_translations` DROP COLUMN `mood_tags`;--> statement-breakpoint
ALTER TABLE `destination_translations` DROP COLUMN `audio_url`;