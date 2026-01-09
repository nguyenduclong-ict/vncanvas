ALTER TABLE `destination_translations` ADD `draft` text;--> statement-breakpoint
ALTER TABLE `destinations` ADD `draft` text;--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_queue_status_created_idx` ON `jobs` (`queue`,`status`,`created_at`);