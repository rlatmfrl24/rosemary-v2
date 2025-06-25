import { torrent_tracker_history } from '$lib/server/db/schema';
import { type Actions } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';

interface TorrentTrackerHistory {
	date: string;
	country: string;
	rank: number;
	name: string;
}

export const actions: Actions = {
	checkAlreadyUpdated: async (event) => {
		// check if the date and country is already in the database
		const db = drizzle(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const date = formData.get('date') as string;
		const country = formData.get('country') as string;

		const result = await db
			.select()
			.from(torrent_tracker_history)
			.where(
				and(eq(torrent_tracker_history.date, date), eq(torrent_tracker_history.country, country))
			);

		const isUpdated = result.length > 0;
		return { isUpdated };
	},
	checkAllCountriesStatus: async (event) => {
		// 모든 국가의 특정 날짜 상태를 일괄 조회
		const db = drizzle(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const date = formData.get('date') as string;

		// 해당 날짜에 대한 모든 국가 데이터 조회
		const results = await db
			.select({ country: torrent_tracker_history.country })
			.from(torrent_tracker_history)
			.where(eq(torrent_tracker_history.date, date));

		// 국가별 업데이트 상태를 객체로 반환
		const statusMap: Record<string, boolean> = {};
		const updatedCountries = new Set(results.map((row) => row.country));

		// 모든 가능한 국가에 대해 상태 설정
		const allCountries = ['KR', 'US', 'JP', 'CN'];
		allCountries.forEach((country) => {
			statusMap[country] = updatedCountries.has(country);
		});

		return { statusMap };
	},
	update: async (event) => {
		const db = drizzle(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const dataString = formData.get('data') as string;
		const body = JSON.parse(dataString) as TorrentTrackerHistory[];
		const result = await db.insert(torrent_tracker_history).values(body);
		return { success: true, message: 'Update successful', result };
	},
	clearDB: async (event) => {
		const db = drizzle(event.platform?.env.DB as D1Database);
		const result = await db.delete(torrent_tracker_history);
		return { success: true, message: 'Clear DB successful', result };
	}
};
