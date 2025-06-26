import type { Actions, PageServerLoad } from '../$types';
import { GET } from '../api/crawl/+server';
import {
	getNewItems,
	getLastCrawlTime,
	clearNewItems,
	clearHistory
} from '@/lib/server/hitomi-tracker/database';

// 크롤링 API 응답 타입 정의
interface CrawlApiResponse {
	success: boolean;
	message?: string;
	crawledCount?: number;
	savedCount?: number;
	failedCount?: number;
	error?: string;
	details?: string;
}

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
			const response = await GET(context as never);
			const result = (await response.json()) as CrawlApiResponse;

			if (result.success) {
				return {
					success: true,
					message: result.message,
					crawledCount: result.crawledCount,
					savedCount: result.savedCount,
					failedCount: result.failedCount
				};
			} else {
				return {
					success: false,
					error: result.details || result.error || '알 수 없는 오류가 발생했습니다.'
				};
			}
		} catch (error) {
			console.error('Failed to call crawl API:', error);

			const errorMessage =
				error instanceof Error ? error.message : '크롤링 API 호출 중 오류가 발생했습니다.';

			return {
				success: false,
				error: errorMessage
			};
		}
	}
};
