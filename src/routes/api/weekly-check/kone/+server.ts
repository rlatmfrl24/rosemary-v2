import { error, json, type RequestHandler } from '@sveltejs/kit';
import { parseKone, saveKonePosts, saveKoneState } from '$lib/server/scraper/kone';
import { nowEpochSeconds } from '$lib/server/scraper/utils';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	const body = (await request.json().catch(() => null)) as unknown;
	const html =
		typeof (body as { html?: unknown })?.html === 'string' ? (body as { html: string }).html : '';
	const targetUrl =
		typeof (body as { targetUrl?: unknown })?.targetUrl === 'string'
			? (body as { targetUrl: string }).targetUrl
			: 'manual-html';

	if (!html.trim()) throw error(400, 'html is required');

	const timestamp = nowEpochSeconds();

	await saveKoneState(db, {
		status: 'running',
		message: '정적 HTML 파싱 중',
		targetUrl,
		lastRun: timestamp
	});

	try {
		const posts = parseKone(html);
		console.info('[kone api] parsed count', posts.length);
		if (!posts.length) throw new Error('파싱 결과가 없습니다');

		await saveKonePosts(posts, db);
		await saveKoneState(db, {
			status: 'success',
			message: `성공 (신규 ${posts.length}건)`,
			targetUrl,
			lastRun: timestamp
		});

		return json({ count: posts.length });
	} catch (err) {
		await saveKoneState(db, {
			status: 'error',
			message: err instanceof Error ? err.message : 'unknown error',
			targetUrl,
			lastRun: Math.floor(Date.now() / 1000)
		});
		throw error(400, err instanceof Error ? err.message : 'parse failed');
	}
};
