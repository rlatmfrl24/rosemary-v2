import { json, error, type RequestHandler } from '@sveltejs/kit';
import { ingestMissavHtml, scrapeMissav } from '$lib/server/scraper/missav';

const DEFAULT_TARGET = 'https://missav123.to/ko/all?sort=weekly_views';

export const POST: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	let targetUrl = DEFAULT_TARGET;
	let html: string | null = null;

	const body = (await request.json().catch(() => null)) as unknown;
	if (typeof body === 'object' && body !== null) {
		const rawTarget = (body as { targetUrl?: unknown }).targetUrl;
		if (typeof rawTarget === 'string' && rawTarget.trim()) {
			targetUrl = rawTarget.trim();
		}
		const rawHtml = (body as { html?: unknown }).html;
		if (typeof rawHtml === 'string') {
			html = rawHtml;
		}
	}

	try {
		if (html?.trim()) {
			const result = await ingestMissavHtml(html, targetUrl, db);
			return json({ ok: true, count: result.count, targetUrl, mode: 'manual' });
		}

		const result = await scrapeMissav(targetUrl, db);
		return json({ ok: true, count: result.count, targetUrl, mode: 'auto' });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('missav scrape failed', message);
		throw error(500, message);
	}
};

