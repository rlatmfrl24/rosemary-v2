import { hitomi_history, new_item_list } from '@/lib/server/db/schema';
import type { Actions, PageServerLoad } from '../$types';
import { drizzle } from 'drizzle-orm/d1';
import { GET } from '../api/crawl/+server';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (context) => {
	try {
		const db = drizzle(context.platform?.env.DB as D1Database);
		const newItems = await db.select().from(new_item_list).orderBy(desc(new_item_list.createdAt));

		// 마지막 크롤링 시간 계산
		const lastCrawlTime = newItems.length > 0 ? newItems[0].createdAt : null;

		return {
			new_item_list: newItems,
			lastCrawlTime
		};
	} catch (e) {
		console.error(e);
		return {
			new_item_list: [],
			lastCrawlTime: null
		};
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
