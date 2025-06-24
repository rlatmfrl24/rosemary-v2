CREATE TABLE `torrent-tracker-history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`date` text NOT NULL,
	`rank` integer NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
