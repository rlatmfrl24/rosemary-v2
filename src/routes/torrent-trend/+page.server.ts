import type { PageServerLoad, Actions } from './$types';
import { torrent_tracker_history, torrent_trend } from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

interface TorrentTrendItem {
	name: string;
	countries: string[];
	dates: string[];
	ranks: number[];
	bestRank: number;
	totalEntries: number;
	avgRank: number;
	downloaded: boolean;
	downloadedAt: string | null;
	torrentTrackerId: number; // 대표 ID (첫 번째 항목)
}

interface GroupedItem {
	name: string;
	countries: Set<string>;
	dates: Set<string>;
	ranks: number[];
	bestRank: number;
	totalEntries: number;
	torrentTrackerId: number;
	downloaded: boolean;
	downloadedAt: string | null;
}

export const load: PageServerLoad = async (event) => {
	try {
		const db = drizzle(event.platform?.env.DB as D1Database);

		// torrent_tracker_history와 torrent_trend를 left join으로 조회
		const rawData = await db
			.select({
				id: torrent_tracker_history.id,
				name: torrent_tracker_history.name,
				country: torrent_tracker_history.country,
				date: torrent_tracker_history.date,
				rank: torrent_tracker_history.rank,
				downloaded: sql<boolean>`COALESCE(${torrent_trend.downloaded}, 0)`.as('downloaded'),
				downloadedAt: torrent_trend.downloadedAt
			})
			.from(torrent_tracker_history)
			.leftJoin(torrent_trend, eq(torrent_tracker_history.id, torrent_trend.torrent_tracker_id));

		// name을 기준으로 그룹화
		const groupedData = rawData.reduce((acc: Record<string, GroupedItem>, item) => {
			if (!acc[item.name]) {
				acc[item.name] = {
					name: item.name,
					countries: new Set(),
					dates: new Set(),
					ranks: [],
					bestRank: Number.MAX_SAFE_INTEGER,
					totalEntries: 0,
					torrentTrackerId: item.id,
					downloaded: false,
					downloadedAt: null
				};
			}

			acc[item.name].countries.add(item.country);
			acc[item.name].dates.add(item.date);
			acc[item.name].ranks.push(item.rank);
			acc[item.name].bestRank = Math.min(acc[item.name].bestRank, item.rank);
			acc[item.name].totalEntries++;

			// 다운로드 상태는 하나라도 true면 true로 설정
			if (item.downloaded) {
				acc[item.name].downloaded = true;
				acc[item.name].downloadedAt = item.downloadedAt
					? new Date(item.downloadedAt * 1000).toISOString().split('T')[0]
					: null;
			}

			return acc;
		}, {});

		// 배열로 변환하고 정렬 (등장 횟수 내림차순 기준 -> 평균 순위 오름차순 기준 -> 최고 순위 오름차순 기준)
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
				),
				downloaded: group.downloaded,
				downloadedAt: group.downloadedAt,
				torrentTrackerId: group.torrentTrackerId
			}))
			.sort((a: TorrentTrendItem, b: TorrentTrendItem) => {
				if (a.totalEntries !== b.totalEntries) return b.totalEntries - a.totalEntries;
				if (a.avgRank !== b.avgRank) return a.avgRank - b.avgRank;
				return a.bestRank - b.bestRank;
			});

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

export const actions: Actions = {
	updateDownloadStatus: async (event) => {
		try {
			const db = drizzle(event.platform?.env.DB as D1Database);
			const formData = await event.request.formData();

			const torrentTrackerId = parseInt(formData.get('torrentTrackerId') as string);
			const downloaded = formData.get('downloaded') === 'true';

			if (!torrentTrackerId) {
				return fail(400, { message: '토렌트 ID가 필요합니다.' });
			}

			// 기존 레코드 확인
			const existingRecord = await db
				.select()
				.from(torrent_trend)
				.where(eq(torrent_trend.torrent_tracker_id, torrentTrackerId))
				.limit(1);

			const now = Math.floor(Date.now() / 1000);

			if (existingRecord.length > 0) {
				// 기존 레코드 업데이트
				await db
					.update(torrent_trend)
					.set({
						downloaded,
						downloadedAt: downloaded ? now : null
					})
					.where(eq(torrent_trend.torrent_tracker_id, torrentTrackerId));
			} else {
				// 새 레코드 생성
				await db.insert(torrent_trend).values({
					torrent_tracker_id: torrentTrackerId,
					downloaded,
					downloadedAt: downloaded ? now : null
				});
			}

			return { success: true };
		} catch (error) {
			console.error('Error updating download status:', error);
			return fail(500, { message: '다운로드 상태 업데이트에 실패했습니다.' });
		}
	}
};
