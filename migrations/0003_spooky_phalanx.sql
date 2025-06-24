PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_hitomi-history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_hitomi-history`("id", "code", "name", "type", "url", "createdAt") SELECT "id", "code", "name", "type", "url", "createdAt" FROM `hitomi-history`;--> statement-breakpoint
DROP TABLE `hitomi-history`;--> statement-breakpoint
ALTER TABLE `__new_hitomi-history` RENAME TO `hitomi-history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_new-item-list` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_new-item-list`("id", "code", "name", "type", "url", "createdAt") SELECT "id", "code", "name", "type", "url", "createdAt" FROM `new-item-list`;--> statement-breakpoint
DROP TABLE `new-item-list`;--> statement-breakpoint
ALTER TABLE `__new_new-item-list` RENAME TO `new-item-list`;--> statement-breakpoint
CREATE TABLE `__new_torrent-tracker-history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`date` text NOT NULL,
	`rank` integer NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_torrent-tracker-history`("id", "name", "country", "date", "rank", "createdAt") SELECT "id", "name", "country", "date", "rank", "createdAt" FROM `torrent-tracker-history`;--> statement-breakpoint
DROP TABLE `torrent-tracker-history`;--> statement-breakpoint
ALTER TABLE `__new_torrent-tracker-history` RENAME TO `torrent-tracker-history`;