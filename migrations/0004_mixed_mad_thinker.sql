CREATE TABLE `torrent-trend` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`torrent_tracker_id` integer NOT NULL,
	`downloaded` integer DEFAULT false NOT NULL,
	`downloadedAt` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`torrent_tracker_id`) REFERENCES `torrent-tracker-history`(`id`) ON UPDATE no action ON DELETE no action
);
