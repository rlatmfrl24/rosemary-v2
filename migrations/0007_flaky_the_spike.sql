CREATE TABLE `weekly-check-posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site` text NOT NULL,
	`sourceId` text NOT NULL,
	`title` text NOT NULL,
	`thumbnail` text,
	`postedAt` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`liked` integer DEFAULT false NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly-check-posts__site_source_idx` ON `weekly-check-posts` (`site`,`sourceId`);--> statement-breakpoint
CREATE TABLE `weekly-check-scraper-state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site` text NOT NULL,
	`targetUrl` text NOT NULL,
	`status` text DEFAULT 'idle' NOT NULL,
	`message` text,
	`lastRun` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly-check-scraper-state_site_unique` ON `weekly-check-scraper-state` (`site`);