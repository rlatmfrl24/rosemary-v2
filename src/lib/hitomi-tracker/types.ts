import type { new_item_list } from '@/lib/server/db/schema';

export type HitomiItem = typeof new_item_list.$inferSelect;

export type CrawlStatus = 'idle' | 'running' | 'success' | 'failed';

export interface LastCrawlState {
	startedAt: number | null;
	completedAt: number | null;
	status: CrawlStatus;
	error: string | null;
	durationMs: number | null;
	crawledCount: number;
	savedCount: number;
	failedCount: number;
}

export interface PaginationData {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface HitomiTrackerData {
	new_item_list: HitomiItem[];
	lastCrawl: LastCrawlState;
	pagination: PaginationData;
}

export interface EnhanceResult {
	update: () => Promise<void>;
}
