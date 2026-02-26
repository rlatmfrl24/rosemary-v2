CREATE TABLE IF NOT EXISTS `daily_check_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`url` text NOT NULL,
	`notes` text,
	`estimatedMinutes` integer,
	`resetTime` text NOT NULL,
	`timeZone` text NOT NULL,
	`completionCycleKey` text,
	`completedAt` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `daily_check_items_resetTime_idx` ON `daily_check_items` (`resetTime`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_items_completionCycleKey_idx` ON `daily_check_items` (`completionCycleKey`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_items_createdAt_idx` ON `daily_check_items` (`createdAt`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `daily_check_push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`lastSuccessAt` integer,
	`lastError` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `daily_check_push_subscriptions_endpoint_unique`
	ON `daily_check_push_subscriptions` (`endpoint`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_push_subscriptions_updatedAt_idx`
	ON `daily_check_push_subscriptions` (`updatedAt`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `daily_check_notification_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemId` integer NOT NULL REFERENCES `daily_check_items`(`id`) ON DELETE cascade,
	`cycleKey` text NOT NULL,
	`channel` text DEFAULT 'web_push' NOT NULL,
	`sentAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `daily_check_notification_logs_item_cycle_channel_unique`
	ON `daily_check_notification_logs` (`itemId`, `cycleKey`, `channel`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_notification_logs_cycle_idx`
	ON `daily_check_notification_logs` (`cycleKey`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_notification_logs_sentAt_idx`
	ON `daily_check_notification_logs` (`sentAt`);
