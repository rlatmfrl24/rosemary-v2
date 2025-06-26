import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';
import { hitomi_history, new_item_list } from '@/lib/server/db/schema';
import type { HitomiItem } from '@/lib/hitomi-tracker/types';

/**
 * 데이터베이스 인스턴스 생성
 */
export function createDatabase(db: D1Database) {
	return drizzle(db);
}

/**
 * 새로운 아이템 목록 조회
 */
export async function getNewItems(db: D1Database): Promise<HitomiItem[]> {
	try {
		const database = createDatabase(db);
		return await database.select().from(new_item_list).orderBy(desc(new_item_list.createdAt));
	} catch (error) {
		console.error('Failed to fetch new items:', error);
		return [];
	}
}

/**
 * 마지막 크롤링 시간 조회
 */
export async function getLastCrawlTime(db: D1Database): Promise<number | string | null> {
	try {
		const database = createDatabase(db);
		const historyItems = await database
			.select()
			.from(hitomi_history)
			.orderBy(desc(hitomi_history.createdAt))
			.limit(1);

		const result = historyItems.length > 0 ? historyItems[0].createdAt : null;

		// 디버깅을 위한 로그 추가
		// console.log('getLastCrawlTime result:', {
		// 	hasHistoryItems: historyItems.length > 0,
		// 	result,
		// 	resultType: typeof result,
		// 	resultValue: result
		// });

		return result;
	} catch (error) {
		console.error('Failed to fetch last crawl time:', error);
		return null;
	}
}

/**
 * 새로운 아이템 목록 삭제
 */
export async function clearNewItems(db: D1Database): Promise<boolean> {
	try {
		const database = createDatabase(db);
		await database.delete(new_item_list).execute();
		return true;
	} catch (error) {
		console.error('Failed to clear new items:', error);
		return false;
	}
}

/**
 * 크롤링 히스토리 삭제
 */
export async function clearHistory(db: D1Database): Promise<boolean> {
	try {
		const database = createDatabase(db);
		await database.delete(hitomi_history).execute();
		return true;
	} catch (error) {
		console.error('Failed to clear history:', error);
		return false;
	}
}
