import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const hitomi_history = sqliteTable(
	'hitomi-history',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		type: text('type').notNull(),
		url: text('url').notNull(),
		createdAt: integer('createdAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		codeUnique: uniqueIndex('hitomi-history_code_unique').on(table.code),
		createdAtIdx: index('hitomi-history_createdAt_idx').on(table.createdAt)
	})
);

export const new_item_list = sqliteTable(
	'new-item-list',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		code: text('code').notNull(),
		name: text('name').notNull(),
		type: text('type').notNull(),
		url: text('url').notNull(),
		createdAt: integer('createdAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		codeUnique: uniqueIndex('new-item-list_code_unique').on(table.code),
		createdAtIdx: index('new-item-list_createdAt_idx').on(table.createdAt)
	})
);

export const hitomi_crawl_state = sqliteTable('hitomi-crawl-state', {
	key: text('key').primaryKey(),
	lastStartedAt: integer('lastStartedAt'),
	lastCompletedAt: integer('lastCompletedAt'),
	lastStatus: text('lastStatus').notNull().default('idle'),
	lastError: text('lastError'),
	lastDurationMs: integer('lastDurationMs'),
	lastCrawledCount: integer('lastCrawledCount').notNull().default(0),
	lastSavedCount: integer('lastSavedCount').notNull().default(0),
	lastFailedCount: integer('lastFailedCount').notNull().default(0),
	updatedAt: integer('updatedAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});

export const hitomi_crawl_lock = sqliteTable('hitomi-crawl-lock', {
	key: text('key').primaryKey(),
	owner: text('owner').notNull(),
	lockedAt: integer('lockedAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`),
	expiresAt: integer('expiresAt').notNull()
});

export const hitomi_crawl_rate_limit = sqliteTable(
	'hitomi-crawl-rate-limit',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		scope: text('scope').notNull(),
		key: text('key').notNull(),
		windowStart: integer('windowStart').notNull(),
		count: integer('count').notNull().default(1),
		updatedAt: integer('updatedAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		scopeKeyWindowUnique: uniqueIndex('hitomi-crawl-rate-limit_scope_key_window_unique').on(
			table.scope,
			table.key,
			table.windowStart
		),
		scopeWindowIdx: index('hitomi-crawl-rate-limit_scope_window_idx').on(
			table.scope,
			table.windowStart
		)
	})
);
