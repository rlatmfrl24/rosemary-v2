import { error, json, type RequestHandler } from '@sveltejs/kit';
import { weekly_check_scraper_state } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'torrentbot',
			targetUrl: 'manual-html',
			status: 'error',
			message: '정적 HTML 파서 미구현',
			lastRun: sql`(strftime('%s', 'now'))`
		})
		.onConflictDoUpdate({
			target: weekly_check_scraper_state.site,
			set: {
				status: 'error',
				message: '정적 HTML 파서 미구현',
				lastRun: sql`(strftime('%s', 'now'))`
			}
		});

	throw error(400, 'torrentbot 정적 HTML 파서가 아직 준비되지 않았습니다.');
};

export const GET: RequestHandler = async () => {
	return json({ message: '미구현 (정적 HTML 파서 준비 필요)' });
};
