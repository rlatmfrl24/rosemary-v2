import type { new_item_list } from '@/lib/server/db/schema';

export type HitomiItem = typeof new_item_list.$inferSelect;

export interface HitomiTrackerData {
	new_item_list: HitomiItem[];
	lastCrawlTime: number | string | null;
}

export interface EnhanceResult {
	update: () => Promise<void>;
}
