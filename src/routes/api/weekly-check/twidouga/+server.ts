import { error, json, type RequestHandler } from '@sveltejs/kit';
import { parseTwidouga } from '$lib/server/scraper/twidouga';
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
		// Since we already have the HTML, we mock a scraper function that just returns the parsed result.
		// We use 'twidouga' as site key.
		const result = await service.runScraper('twidouga', targetUrl, async () => {
			return parseTwidouga(html);
		});
		return json(result);
	} catch (err) {
		throw error(400, err instanceof Error ? err.message : 'parse failed');
	}
};
