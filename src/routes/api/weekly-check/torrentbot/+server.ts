import { error, json, type RequestHandler } from '@sveltejs/kit';
import { parseTorrentbot } from '$lib/server/scraper/torrentbot';
import { WeeklyCheckService } from '$lib/server/services/weekly-check';

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

	const service = new WeeklyCheckService(db);

	try {
		const result = await service.runScraper('torrentbot', targetUrl, async () => {
			return parseTorrentbot(html);
		});
		return json(result);
	} catch (err) {
		throw error(400, err instanceof Error ? err.message : 'parse failed');
	}
};
