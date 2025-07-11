import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

export const torrent_tracker_history = sqliteTable('torrent-tracker-history', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	country: text('country').notNull(),
	date: text('date').notNull(),
	rank: integer('rank').notNull(),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});

export const torrent_trend = sqliteTable('torrent-trend', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	torrent_tracker_id: integer('torrent_tracker_id')
		.notNull()
		.references(() => torrent_tracker_history.id),
	downloaded: integer('downloaded', { mode: 'boolean' }).notNull().default(false),
	downloadedAt: integer('downloadedAt'),
	createdAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
});
