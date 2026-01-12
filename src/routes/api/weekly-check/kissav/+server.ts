import { json, error, type RequestHandler } from '@sveltejs/kit';
import { scrapeKissav } from '$lib/server/scraper/kissav';
import { WeeklyCheckService } from '$lib/server/services/weekly-check';

const DEFAULT_TARGET = 'https://kissjav.com/most-popular/?sort_by=video_viewed_week';
const MAX_PAGES = 5;

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	let targetUrl = DEFAULT_TARGET;
	let maxPages = 1;

	try {
		const body = (await request.json().catch(() => null)) as unknown;
		if (typeof body === 'object' && body !== null) {
			const rawTarget = (body as { targetUrl?: unknown }).targetUrl;
			if (typeof rawTarget === 'string') {
				const trimmed = rawTarget.trim();
				if (trimmed.startsWith('http')) {
					targetUrl = trimmed;
				}
			}
			const rawMaxPages = (body as { maxPages?: unknown }).maxPages;
			if (typeof rawMaxPages === 'number' && rawMaxPages > 0) {
				maxPages = Math.min(Math.floor(rawMaxPages), MAX_PAGES);
			}
		}
	} catch {
		// ignore parse errors, keep default
	}

	const service = new WeeklyCheckService(db);

	try {
		const result = await service.runScraper(
			'kissav',
			targetUrl,
			(url) => scrapeKissav(url),
			maxPages
		);
		return json({ ok: true, count: result.count, targetUrl });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('kissav scrape failed', message);
		throw error(500, message);
	}
};
