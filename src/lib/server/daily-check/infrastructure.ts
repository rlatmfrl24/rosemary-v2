const SQL_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS "daily_check_items" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"title" text NOT NULL,
		"kind" text NOT NULL,
		"importance" text DEFAULT 'normal' NOT NULL,
		"url" text NOT NULL,
		"notes" text,
		"estimatedMinutes" integer,
		"resetTimes" text DEFAULT '["09:00"]' NOT NULL,
		"resetTime" text NOT NULL,
		"timeZone" text NOT NULL,
		"completionCycleKey" text,
		"completedAt" integer,
		"createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
		"updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS "daily_check_items_importance_idx" ON "daily_check_items" ("importance")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_items_resetTime_idx" ON "daily_check_items" ("resetTime")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_items_completionCycleKey_idx" ON "daily_check_items" ("completionCycleKey")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_items_createdAt_idx" ON "daily_check_items" ("createdAt")`,
	`ALTER TABLE "daily_check_items" ADD COLUMN "importance" text DEFAULT 'normal' NOT NULL`,
	`ALTER TABLE "daily_check_items" ADD COLUMN "resetTimes" text DEFAULT '["09:00"]' NOT NULL`,
	`UPDATE "daily_check_items"
	 SET "importance" = 'normal'
	 WHERE "importance" IS NULL OR trim("importance") = ''`,
	`UPDATE "daily_check_items"
	 SET "resetTimes" = json_array("resetTime")
	 WHERE ("resetTimes" IS NULL OR trim("resetTimes") = '' OR "resetTimes" = '[]')
	   AND "resetTime" IS NOT NULL
	   AND trim("resetTime") != ''`,
	`CREATE TABLE IF NOT EXISTS "daily_check_push_subscriptions" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"endpoint" text NOT NULL,
		"p256dh" text NOT NULL,
		"auth" text NOT NULL,
		"userAgent" text,
		"lastSuccessAt" integer,
		"lastError" text,
		"createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
		"updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "daily_check_push_subscriptions_endpoint_unique"
		ON "daily_check_push_subscriptions" ("endpoint")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_push_subscriptions_updatedAt_idx"
		ON "daily_check_push_subscriptions" ("updatedAt")`,
	`CREATE TABLE IF NOT EXISTS "daily_check_notification_logs" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"itemId" integer NOT NULL REFERENCES "daily_check_items"("id") ON DELETE CASCADE,
		"cycleKey" text NOT NULL,
		"channel" text DEFAULT 'web_push' NOT NULL,
		"sentAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "daily_check_notification_logs_item_cycle_channel_unique"
		ON "daily_check_notification_logs" ("itemId", "cycleKey", "channel")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_notification_logs_cycle_idx" ON "daily_check_notification_logs" ("cycleKey")`,
	`CREATE INDEX IF NOT EXISTS "daily_check_notification_logs_sentAt_idx" ON "daily_check_notification_logs" ("sentAt")`
] as const;

let bootstrapDone = false;
let bootstrapPromise: Promise<void> | null = null;

function shouldIgnoreMigrationError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return error.message.includes('duplicate column name');
}

export async function ensureDailyCheckInfrastructure(db: D1Database): Promise<void> {
	if (bootstrapDone) return;
	if (!bootstrapPromise) {
		bootstrapPromise = (async () => {
			for (const statement of SQL_STATEMENTS) {
				try {
					await db.prepare(statement).run();
				} catch (error) {
					if (!shouldIgnoreMigrationError(error)) {
						throw error;
					}
				}
			}
			bootstrapDone = true;
		})().finally(() => {
			bootstrapPromise = null;
		});
	}

	await bootstrapPromise;
}
