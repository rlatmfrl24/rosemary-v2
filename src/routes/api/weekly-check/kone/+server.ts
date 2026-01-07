import { error, json, type RequestHandler } from '@sveltejs/kit';
import { parseKone, saveKonePosts, saveKoneState } from '$lib/server/scraper/kone';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	const body = await request.json().catch(() => ({}));
	const html = typeof body?.html === 'string' ? body.html : '';
	const targetUrl = typeof body?.targetUrl === 'string' ? body.targetUrl : 'manual-html';

	if (!html.trim()) throw error(400, 'html is required');

	await saveKoneState(db, {
		status: 'running',
		message: '정적 HTML 파싱 중',
		targetUrl,
		lastRun: sql`(strftime('%s', 'now'))`
	});

	try {
		const posts = parseKone(html);
		if (!posts.length) throw new Error('파싱 결과가 없습니다');

		await saveKonePosts(posts, db);
		await saveKoneState(db, {
			status: 'success',
			message: `성공 (신규 ${posts.length}건)`,
			targetUrl,
			lastRun: sql`(strftime('%s', 'now'))`
		});

		return json({ count: posts.length });
	} catch (err) {
		await saveKoneState(db, {
			status: 'error',
			message: err instanceof Error ? err.message : 'unknown error',
			targetUrl,
			lastRun: sql`(strftime('%s', 'now'))`
		});
		throw error(400, err instanceof Error ? err.message : 'parse failed');
	}
};

