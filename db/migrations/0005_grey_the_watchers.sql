DROP INDEX `jobs_queue_status_created_idx`;--> statement-breakpoint
CREATE INDEX `jobs_queue_status_created_idx` ON `jobs` (`queue`,`status`,`created_at`);