import { json, error, type RequestHandler } from '@sveltejs/kit';
import { ingestMissavHtml, scrapeMissav } from '$lib/server/scraper/missav';
import { WeeklyCheckService } from '$lib/server/services/weekly-check';

const DEFAULT_TARGET = 'https://missav123.to/ko/all?sort=weekly_views';
const MAX_PAGES = 5;

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	let targetUrl = DEFAULT_TARGET;
	let html: string | null = null;
	let maxPages = 1;

	const body = (await request.json().catch(() => null)) as unknown;
	if (typeof body === 'object' && body !== null) {
		const rawTarget = (body as { targetUrl?: unknown }).targetUrl;
		if (typeof rawTarget === 'string') {
			const trimmed = rawTarget.trim();
			if (trimmed.startsWith('http')) {
				targetUrl = trimmed;
			}
		}
		const rawHtml = (body as { html?: unknown }).html;
		if (typeof rawHtml === 'string') {
			html = rawHtml;
		}
		const rawMaxPages = (body as { maxPages?: unknown }).maxPages;
		if (typeof rawMaxPages === 'number' && rawMaxPages > 0) {
			maxPages = Math.min(Math.floor(rawMaxPages), MAX_PAGES);
		}
	}

	const service = new WeeklyCheckService(db);

	try {
		if (html?.trim()) {
			// Manual ingestion typically single page content
			const result = await service.runScraper('missav', targetUrl, async () => {
				return ingestMissavHtml(html!, targetUrl);
			});
			return json({ ok: true, count: result.count, targetUrl, mode: 'manual' });
		}

		// Auto scrape with pagination
		const result = await service.runScraper(
			'missav',
			targetUrl,
			(url) => scrapeMissav(url),
			maxPages
		);
		return json({ ok: true, count: result.count, targetUrl, mode: 'auto' });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('missav scrape failed', message);
		throw error(500, message);
	}
};
