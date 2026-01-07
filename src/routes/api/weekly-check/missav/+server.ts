import { json, error, type RequestHandler } from '@sveltejs/kit';
import { scrapeMissav } from '$lib/server/scraper/missav';

const DEFAULT_TARGET = 'https://missav123.to/ko/all?sort=weekly_views';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	let targetUrl = DEFAULT_TARGET;
	try {
		const body = (await request.json().catch(() => null)) as unknown;
		if (
			typeof body === 'object' &&
			body !== null &&
			typeof (body as { targetUrl?: unknown }).targetUrl === 'string' &&
			(body as { targetUrl: string }).targetUrl.trim()
		) {
			targetUrl = (body as { targetUrl: string }).targetUrl.trim();
		}
	} catch {
		// ignore parse errors, keep default
	}

	try {
		const result = await scrapeMissav(targetUrl, db);
		return json({ ok: true, count: result.count, targetUrl });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('missav scrape failed', message);
		throw error(500, message);
	}
};

