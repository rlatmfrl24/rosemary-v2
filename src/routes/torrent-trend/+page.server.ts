import type { PageServerLoad } from './$types';
import { torrent_tracker_history } from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/d1';

interface TorrentTrendItem {
	name: string;
	countries: string[];
	dates: string[];
	ranks: number[];
	bestRank: number;
	totalEntries: number;
	avgRank: number;
}

interface GroupedItem {
	name: string;
	countries: Set<string>;
	dates: Set<string>;
	ranks: number[];
	bestRank: number;
	totalEntries: number;
}

export const load: PageServerLoad = async (event) => {
	try {
		const db = drizzle(event.platform?.env.DB as D1Database);

		// torrent_tracker_history에서 모든 데이터 조회
		const rawData = await db.select().from(torrent_tracker_history);

		// name을 기준으로 그룹화
		const groupedData = rawData.reduce((acc: Record<string, GroupedItem>, item) => {
			if (!acc[item.name]) {
				acc[item.name] = {
					name: item.name,
					countries: new Set(),
					dates: new Set(),
					ranks: [],
					bestRank: Number.MAX_SAFE_INTEGER,
					totalEntries: 0
				};
			}

			acc[item.name].countries.add(item.country);
			acc[item.name].dates.add(item.date);
			acc[item.name].ranks.push(item.rank);
			acc[item.name].bestRank = Math.min(acc[item.name].bestRank, item.rank);
			acc[item.name].totalEntries++;

			return acc;
		}, {});

		// 배열로 변환하고 정렬 (최고 순위 기준)
		const trendData: TorrentTrendItem[] = Object.values(groupedData)
			.map((group: GroupedItem) => ({
				name: group.name,
				countries: Array.from(group.countries).sort(),
				dates: Array.from(group.dates).sort(),
				ranks: group.ranks.sort((a: number, b: number) => a - b),
				bestRank: group.bestRank,
				totalEntries: group.totalEntries,
				avgRank: Math.round(
					group.ranks.reduce((sum: number, rank: number) => sum + rank, 0) / group.ranks.length
				)
			}))
			.sort((a: TorrentTrendItem, b: TorrentTrendItem) => a.bestRank - b.bestRank);

		return {
			trendData
		};
	} catch (error) {
		console.error('Error loading torrent trend data:', error);
		return {
			trendData: []
		};
	}
};
