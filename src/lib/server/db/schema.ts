import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const hitomi_history = sqliteTable('hitomi-history', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').notNull(),
	name: text('name').notNull(),
	type: text('type').notNull(),
	url: text('url').notNull(),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});

export const new_item_list = sqliteTable('new-item-list', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').notNull(),
	name: text('name').notNull(),
	type: text('type').notNull(),
	url: text('url').notNull(),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});

export const local_trend = sqliteTable('local-trend', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	downloaded: integer('downloaded', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});

export const weekly_check_posts = sqliteTable(
	'weekly-check-posts',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		site: text('site').notNull(),
		sourceId: text('sourceId').notNull(),
		title: text('title').notNull(),
		thumbnail: text('thumbnail'),
		postedAt: text('postedAt'),
		likes: integer('likes').notNull().default(0),
		liked: integer('liked', { mode: 'boolean' }).notNull().default(false),
		read: integer('read', { mode: 'boolean' }).notNull().default(false),
		createdAt: integer('createdAt')
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
	},
	(table) => ({
		siteSourceUnique: uniqueIndex('weekly-check-posts__site_source_idx').on(table.site, table.sourceId)
	})
);

export const weekly_check_scraper_state = sqliteTable('weekly-check-scraper-state', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	site: text('site').notNull().unique(),
	targetUrl: text('targetUrl').notNull(),
	status: text('status').notNull().default('idle'),
	message: text('message'),
	lastRun: integer('lastRun'),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});
