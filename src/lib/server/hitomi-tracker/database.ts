import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, sql } from 'drizzle-orm';
import { hitomi_crawl_state, hitomi_history, new_item_list } from '@/lib/server/db/schema';
import type { HitomiItem, LastCrawlState, PaginationData } from '@/lib/hitomi-tracker/types';
import { ensureHitomiTrackerInfrastructure } from './infrastructure';

export const DEFAULT_PAGE_SIZE = 50;
const CRAWL_STATE_KEY = 'global';

export interface PaginatedNewItemsResult {
	items: HitomiItem[];
	pagination: PaginationData;
}

/**
 * 데이터베이스 인스턴스 생성
 */
export function createDatabase(db: D1Database) {
	return drizzle(db);
}

/**
 * 새로운 아이템 목록 조회
 */
export async function getNewItems(
	db: D1Database,
	page: number = 1,
	pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedNewItemsResult> {
	try {
		const database = createDatabase(db);
		const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
		const safePageSize =
			Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : DEFAULT_PAGE_SIZE;
		const countRows = await database.select({ total: sql<number>`count(*)` }).from(new_item_list);
		const totalItems = Number(countRows[0]?.total ?? 0);
		const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
		const normalizedPage = Math.min(safePage, totalPages);
		const offset = (normalizedPage - 1) * safePageSize;
		const items = await database
			.select()
			.from(new_item_list)
			.orderBy(desc(new_item_list.createdAt))
			.limit(safePageSize)
			.offset(offset);

		return {
			items,
			pagination: {
				page: normalizedPage,
				pageSize: safePageSize,
				totalItems,
				totalPages
			}
		};
	} catch (error) {
		console.error('Failed to fetch new items:', error);
		return {
			items: [],
			pagination: {
				page: 1,
				pageSize: DEFAULT_PAGE_SIZE,
				totalItems: 0,
				totalPages: 1
			}
		};
	}
}

/**
 * 전체 코드 목록 조회 (복사 API 용도)
 */
export async function getAllNewItemCodes(db: D1Database): Promise<string[]> {
	try {
		const database = createDatabase(db);
		const rows = await database
			.select({ code: new_item_list.code })
			.from(new_item_list)
			.orderBy(desc(new_item_list.createdAt));
		return rows.map((row) => row.code);
	} catch (error) {
		console.error('Failed to fetch all item codes:', error);
		return [];
	}
}

/**
 * 마지막 크롤링 상태 조회
 */
export async function getLastCrawlState(db: D1Database): Promise<LastCrawlState> {
	const fallback = {
		startedAt: null,
		completedAt: null,
		status: 'idle',
		error: null,
		durationMs: null,
		crawledCount: 0,
		savedCount: 0,
		failedCount: 0
	} as const satisfies LastCrawlState;

	try {
		await ensureHitomiTrackerInfrastructure(db);
		const database = createDatabase(db);
		const [stateRow] = await database
			.select()
			.from(hitomi_crawl_state)
			.where(eq(hitomi_crawl_state.key, CRAWL_STATE_KEY))
			.limit(1);

		if (stateRow) {
			return {
				startedAt: stateRow.lastStartedAt ?? null,
				completedAt: stateRow.lastCompletedAt ?? null,
				status: (stateRow.lastStatus as LastCrawlState['status']) ?? 'idle',
				error: stateRow.lastError ?? null,
				durationMs: stateRow.lastDurationMs ?? null,
				crawledCount: stateRow.lastCrawledCount ?? 0,
				savedCount: stateRow.lastSavedCount ?? 0,
				failedCount: stateRow.lastFailedCount ?? 0
			};
		}

		const [historyRow] = await database
			.select({ maxCreatedAt: sql<number | null>`max(${hitomi_history.createdAt})` })
			.from(hitomi_history);

		return {
			...fallback,
			completedAt: historyRow?.maxCreatedAt ?? null,
			status: historyRow?.maxCreatedAt ? 'success' : 'idle'
		};
	} catch (error) {
		console.error('Failed to fetch last crawl state:', error);
		return fallback;
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
		await ensureHitomiTrackerInfrastructure(db);
		const database = createDatabase(db);
		await database.delete(hitomi_history).execute();
		await database
			.insert(hitomi_crawl_state)
			.values({
				key: CRAWL_STATE_KEY,
				lastStartedAt: null,
				lastCompletedAt: null,
				lastStatus: 'idle',
				lastError: null,
				lastDurationMs: null,
				lastCrawledCount: 0,
				lastSavedCount: 0,
				lastFailedCount: 0,
				updatedAt: sql`(strftime('%s', 'now'))`
			})
			.onConflictDoUpdate({
				target: hitomi_crawl_state.key,
				set: {
					lastStartedAt: null,
					lastCompletedAt: null,
					lastStatus: 'idle',
					lastError: null,
					lastDurationMs: null,
					lastCrawledCount: 0,
					lastSavedCount: 0,
					lastFailedCount: 0,
					updatedAt: sql`(strftime('%s', 'now'))`
				}
			});
		return true;
	} catch (error) {
		console.error('Failed to clear history:', error);
		return false;
	}
}
