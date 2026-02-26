PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "daily_check_items" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"title" text NOT NULL,
		"kind" text NOT NULL,
		"url" text NOT NULL,
		"notes" text,
		"estimatedMinutes" integer,
		"resetTime" text NOT NULL,
		"timeZone" text NOT NULL,
		"completionCycleKey" text,
		"completedAt" integer,
		"createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
		"updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	, "importance" text DEFAULT 'normal' NOT NULL, "resetTimes" text DEFAULT '["09:00"]' NOT NULL);
INSERT INTO "daily_check_items" VALUES(1,'Unlucid 코인 출석체크','site_visit','https://unlucid.ai/gems',NULL,1,'07:00','Asia/Seoul',NULL,NULL,1772067321,1772067321,'normal','["09:00"]');
INSERT INTO "daily_check_items" VALUES(2,'크랙 출석체크','site_visit','https://crack.wrtn.ai/cracker?tab=free',NULL,1,'06:00','Asia/Seoul','2026-02-26',1772068412,1772068083,1772068412,'normal','["09:00"]');