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

export const daily_check_items = sqliteTable(
	'daily_check_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		title: text('title').notNull(),
		kind: text('kind').notNull(),
		importance: text('importance').notNull().default('normal'),
		url: text('url').notNull(),
		notes: text('notes'),
		estimatedMinutes: integer('estimatedMinutes'),
		resetTimes: text('resetTimes').notNull().default('["09:00"]'),
		resetTime: text('resetTime').notNull(),
		timeZone: text('timeZone').notNull(),
		completionCycleKey: text('completionCycleKey'),
		completedAt: integer('completedAt'),
		createdAt: integer('createdAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer('updatedAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		importanceIdx: index('daily_check_items_importance_idx').on(table.importance),
		resetTimeIdx: index('daily_check_items_resetTime_idx').on(table.resetTime),
		completionCycleIdx: index('daily_check_items_completionCycleKey_idx').on(table.completionCycleKey),
		createdAtIdx: index('daily_check_items_createdAt_idx').on(table.createdAt)
	})
);

export const daily_check_push_subscriptions = sqliteTable(
	'daily_check_push_subscriptions',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		endpoint: text('endpoint').notNull(),
		p256dh: text('p256dh').notNull(),
		auth: text('auth').notNull(),
		userAgent: text('userAgent'),
		lastSuccessAt: integer('lastSuccessAt'),
		lastError: text('lastError'),
		createdAt: integer('createdAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer('updatedAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		endpointUnique: uniqueIndex('daily_check_push_subscriptions_endpoint_unique').on(table.endpoint),
		updatedAtIdx: index('daily_check_push_subscriptions_updatedAt_idx').on(table.updatedAt)
	})
);

export const daily_check_notification_logs = sqliteTable(
	'daily_check_notification_logs',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('itemId')
			.notNull()
			.references(() => daily_check_items.id, { onDelete: 'cascade' }),
		cycleKey: text('cycleKey').notNull(),
		channel: text('channel').notNull().default('web_push'),
		sentAt: integer('sentAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		itemCycleChannelUnique: uniqueIndex('daily_check_notification_logs_item_cycle_channel_unique').on(
			table.itemId,
			table.cycleKey,
			table.channel
		),
		cycleIdx: index('daily_check_notification_logs_cycle_idx').on(table.cycleKey),
		sentAtIdx: index('daily_check_notification_logs_sentAt_idx').on(table.sentAt)
	})
);
