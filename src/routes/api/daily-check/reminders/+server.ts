import { getDailyReminder } from '$lib/server/daily-check/database';
import { ensureDailyCheckInfrastructure } from '$lib/server/daily-check/infrastructure';
import { json, type RequestHandler } from '@sveltejs/kit';

function getDb(platform: App.Platform | undefined): D1Database | null {
	return platform?.env?.DB ?? null;
}

export const GET: RequestHandler = async ({ platform }) => {
	const db = getDb(platform);
	if (!db) {
		return json(
			{
				success: false,
				error: '데이터베이스가 연결되지 않았습니다.',
				reminder: null
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	await ensureDailyCheckInfrastructure(db);
	const reminder = await getDailyReminder(db);
	return json(
		{
			success: true,
			reminder
		},
		{
			headers: { 'Cache-Control': 'no-store' }
		}
	);
};
