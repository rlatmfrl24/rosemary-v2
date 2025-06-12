import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const hitomi_history = sqliteTable("hitomi-history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	code: text("code").notNull(),
	name: text("name").notNull(),
	type: text("type").notNull(),
	url: text("url").notNull(),
	createdAt: integer("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const new_item_list = sqliteTable("new-item-list", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	code: text("code").notNull(),
	name: text("name").notNull(),
	type: text("type").notNull(),
	url: text("url").notNull(),
	createdAt: integer("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});
