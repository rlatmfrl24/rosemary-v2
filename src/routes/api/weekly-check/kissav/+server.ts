import { json, error, type RequestHandler } from '@sveltejs/kit';
import { scrapeKissav } from '$lib/server/scraper/kissav';

const DEFAULT_TARGET = 'https://kissjav.com/most-popular/?sort_by=video_viewed_week';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	let targetUrl = DEFAULT_TARGET;
	try {
		const body = await request.json().catch(() => ({}));
		if (typeof body?.targetUrl === 'string' && body.targetUrl.trim()) {
			targetUrl = body.targetUrl.trim();
		}
	} catch {
		// ignore parse errors, keep default
	}

	try {
		const result = await scrapeKissav(targetUrl, db);
		return json({ ok: true, count: result.count, targetUrl });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('kissav scrape failed', message);
		throw error(500, message);
	}
};

