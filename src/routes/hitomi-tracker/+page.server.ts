import { hitomi_history, new_item_list } from '@/lib/server/db/schema';
import type { Actions, PageServerLoad } from '../$types';
import { drizzle } from 'drizzle-orm/d1';
import { GET } from '../api/crawl/+server';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (context) => {
	try {
		const db = drizzle(context.platform?.env.DB as D1Database);
		const newItems = await db.select().from(new_item_list).orderBy(desc(new_item_list.createdAt));
		return {
			new_item_list: newItems
		};
	} catch (e) {
		console.error(e);
		return { new_item_list: [] };
	}
};

export const actions: Actions = {
	clearNewItems: async (context) => {
		const db = drizzle(context.platform?.env.DB as D1Database);
		await db.delete(new_item_list).execute();
		return { success: true };
	},
	clearHistory: async (context) => {
		const db = drizzle(context.platform?.env.DB as D1Database);
		await db.delete(hitomi_history).execute();
		return { success: true };
	},
	callCrawlApi: async (context) => {
		await GET(context as never);
		return { success: true };
	}
};
