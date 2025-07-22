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
	trendScore: number; // 최신 트렌드 점수
	recentActivity: boolean; // 최근 활동 여부
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
	// 새로운 알고리즘을 위한 원시 데이터 저장
	rawEntries: Array<{
		date: string;
		rank: number;
	}>;
}

/**
 * 시간 가중치를 적용하여 토렌트 트렌드 점수를 계산하는 함수
 * @param rawEntries - 각 날짜별 순위 데이터 배열
 * @param lambdaVal - 시간 가중치 감쇠 상수 (기본값: 0.1)
 * @returns 계산된 트렌드 점수
 */
function calculateAdvancedTrendScore(
	rawEntries: Array<{ date: string; rank: number }>,
	lambdaVal: number = 0.1
): number {
	const today = new Date();

	return rawEntries.reduce((totalScore, entry) => {
		const entryDate = new Date(entry.date);

		// 오늘과 데이터 날짜 간의 차이 (일 단위)
		const daysSinceToday = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24));

		// 시간 가중치 (지수 감쇠 적용)
		const timeWeight = Math.pow(2, -lambdaVal * daysSinceToday);

		// 순위 점수 (순위의 역수)
		const rankScore = 1 / entry.rank;

		// 일일 점수
		const dailyScore = rankScore * timeWeight;

		return totalScore + dailyScore;
	}, 0);
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
					downloadedAt: null,
					rawEntries: []
				};
			}

			acc[item.name].countries.add(item.country);
			acc[item.name].dates.add(item.date);
			acc[item.name].ranks.push(item.rank);
			acc[item.name].bestRank = Math.min(acc[item.name].bestRank, item.rank);
			acc[item.name].totalEntries++;
			acc[item.name].rawEntries.push({
				date: item.date,
				rank: item.rank
			});

			// 다운로드 상태는 하나라도 true면 true로 설정
			if (item.downloaded) {
				acc[item.name].downloaded = true;
				acc[item.name].downloadedAt = item.downloadedAt
					? new Date(item.downloadedAt * 1000).toISOString().split('T')[0]
					: null;
			}

			return acc;
		}, {});

		// 새로운 고급 트렌드 점수 계산 적용
		const now = new Date();
		const trendData: TorrentTrendItem[] = Object.values(groupedData)
			.map((group: GroupedItem) => {
				const sortedDates = Array.from(group.dates).sort();
				const sortedRanks = group.ranks.sort((a: number, b: number) => a - b);

				// 최근 7일 이내의 데이터 확인
				const recentDates = sortedDates.filter((date) => {
					const dateObj = new Date(date);
					const diffTime = now.getTime() - dateObj.getTime();
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
					return diffDays <= 7;
				});

				// 새로운 고급 트렌드 점수 계산 (람다값 0.1 사용)
				const advancedTrendScore = calculateAdvancedTrendScore(group.rawEntries, 0.1);

				return {
					name: group.name,
					countries: Array.from(group.countries).sort(),
					dates: sortedDates,
					ranks: sortedRanks,
					bestRank: group.bestRank,
					totalEntries: group.totalEntries,
					avgRank: Math.round(
						group.ranks.reduce((sum: number, rank: number) => sum + rank, 0) / group.ranks.length
					),
					downloaded: group.downloaded,
					downloadedAt: group.downloadedAt,
					torrentTrackerId: group.torrentTrackerId,
					trendScore: advancedTrendScore, // 새로운 고급 트렌드 점수 사용
					recentActivity: recentDates.length > 0 // 최근 활동 여부
				};
			})
			.sort((a: TorrentTrendItem, b: TorrentTrendItem) => {
				// 새로운 트렌드 점수 기준 내림차순 정렬
				return b.trendScore - a.trendScore;
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
