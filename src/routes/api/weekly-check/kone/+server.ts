import { error, json, type RequestHandler } from '@sveltejs/kit';
import { parseKone, saveKonePosts, saveKoneState } from '$lib/server/scraper/kone';

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

	await saveKoneState(db, {
		status: 'running',
		message: '정적 HTML 파싱 중',
		targetUrl,
		lastRun: Math.floor(Date.now() / 1000)
	});

	try {
		const posts = parseKone(html);
		console.info('[kone api] parsed count', posts.length);
		// #region agent log
		fetch('http://127.0.0.1:7243/ingest/16f07aa8-3f43-4715-b7c6-4ddfc723f257', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'H3',
				location: 'kone/+server.ts:POST',
				message: 'api parsed count',
				data: { count: posts.length },
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion
		if (!posts.length) throw new Error('파싱 결과가 없습니다');

		await saveKonePosts(posts, db);
		await saveKoneState(db, {
			status: 'success',
			message: `성공 (신규 ${posts.length}건)`,
			targetUrl,
			lastRun: Math.floor(Date.now() / 1000)
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
