import type { Actions, PageServerLoad } from '../$types';
import { GET } from '../api/crawl/+server';
import {
	getNewItems,
	getLastCrawlTime,
	clearNewItems,
	clearHistory
} from '@/lib/server/hitomi-tracker/database';

export const load: PageServerLoad = async (context) => {
	const db = context.platform?.env.DB as D1Database;

	const [newItems, lastCrawlTime] = await Promise.all([getNewItems(db), getLastCrawlTime(db)]);

	return {
		new_item_list: newItems,
		lastCrawlTime
	};
};

export const actions: Actions = {
	clearNewItems: async (context) => {
		const db = context.platform?.env.DB as D1Database;
		const success = await clearNewItems(db);
		return { success };
	},
	clearHistory: async (context) => {
		const db = context.platform?.env.DB as D1Database;
		const success = await clearHistory(db);
		return { success };
	},
	callCrawlApi: async (context) => {
		try {
			await GET(context as never);
			return { success: true };
		} catch (error) {
			console.error('Failed to call crawl API:', error);
			return { success: false };
		}
	}
};
