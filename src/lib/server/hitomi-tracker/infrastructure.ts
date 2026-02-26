const SQL_STATEMENTS = [
	// Deduplicate before adding unique indexes.
	`DELETE FROM "hitomi-history" AS h
   WHERE EXISTS (
     SELECT 1
     FROM "hitomi-history" AS h2
     WHERE h2."code" = h."code"
       AND (
         h2."createdAt" < h."createdAt"
         OR (h2."createdAt" = h."createdAt" AND h2."id" < h."id")
       )
   )`,
	`DELETE FROM "new-item-list" AS n
   WHERE EXISTS (
     SELECT 1
     FROM "new-item-list" AS n2
     WHERE n2."code" = n."code"
       AND (
         n2."createdAt" > n."createdAt"
         OR (n2."createdAt" = n."createdAt" AND n2."id" > n."id")
       )
   )`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "hitomi-history_code_unique" ON "hitomi-history" ("code")`,
	`CREATE INDEX IF NOT EXISTS "hitomi-history_createdAt_idx" ON "hitomi-history" ("createdAt")`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "new-item-list_code_unique" ON "new-item-list" ("code")`,
	`CREATE INDEX IF NOT EXISTS "new-item-list_createdAt_idx" ON "new-item-list" ("createdAt")`,
	`CREATE TABLE IF NOT EXISTS "hitomi-crawl-state" (
     "key" text PRIMARY KEY NOT NULL,
     "lastStartedAt" integer,
     "lastCompletedAt" integer,
     "lastStatus" text DEFAULT 'idle' NOT NULL,
     "lastError" text,
     "lastDurationMs" integer,
     "lastCrawledCount" integer DEFAULT 0 NOT NULL,
     "lastSavedCount" integer DEFAULT 0 NOT NULL,
     "lastFailedCount" integer DEFAULT 0 NOT NULL,
     "updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
   )`,
	`INSERT INTO "hitomi-crawl-state" (
     "key", "lastStartedAt", "lastCompletedAt", "lastStatus", "lastError",
     "lastDurationMs", "lastCrawledCount", "lastSavedCount", "lastFailedCount", "updatedAt"
   )
   VALUES (
     'global', NULL,
     (SELECT MAX("createdAt") FROM "hitomi-history"),
     CASE WHEN (SELECT COUNT(*) FROM "hitomi-history") > 0 THEN 'success' ELSE 'idle' END,
     NULL, NULL, 0, 0, 0, (strftime('%s', 'now'))
   )
   ON CONFLICT("key") DO NOTHING`,
	`CREATE TABLE IF NOT EXISTS "hitomi-crawl-lock" (
     "key" text PRIMARY KEY NOT NULL,
     "owner" text NOT NULL,
     "lockedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
     "expiresAt" integer NOT NULL
   )`,
	`CREATE TABLE IF NOT EXISTS "hitomi-crawl-rate-limit" (
     "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
     "scope" text NOT NULL,
     "key" text NOT NULL,
     "windowStart" integer NOT NULL,
     "count" integer DEFAULT 1 NOT NULL,
     "updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
   )`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "hitomi-crawl-rate-limit_scope_key_window_unique"
   ON "hitomi-crawl-rate-limit" ("scope", "key", "windowStart")`,
	`CREATE INDEX IF NOT EXISTS "hitomi-crawl-rate-limit_scope_window_idx"
   ON "hitomi-crawl-rate-limit" ("scope", "windowStart")`
] as const;

let bootstrapDone = false;
let bootstrapPromise: Promise<void> | null = null;

export async function ensureHitomiTrackerInfrastructure(db: D1Database): Promise<void> {
	if (bootstrapDone) return;
	if (!bootstrapPromise) {
		bootstrapPromise = (async () => {
			for (const statement of SQL_STATEMENTS) {
				await db.prepare(statement).run();
			}
			bootstrapDone = true;
		})().finally(() => {
			bootstrapPromise = null;
		});
	}
	await bootstrapPromise;
}
