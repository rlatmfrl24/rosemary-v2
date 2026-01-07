import * as cheerio from 'cheerio';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export type KonePost = {
	site: 'kone';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

const KONE_BASE = 'https://kone.gg';
function normalizeText(value?: string | null) {
	return value?.replace(/\s+/g, ' ').trim() ?? '';
}

export function parseKone(html: string): KonePost[] {
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/16f07aa8-3f43-4715-b7c6-4ddfc723f257', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'H1',
			location: 'kone.ts:parseKone',
			message: 'parse start',
			data: { htmlLength: html.length },
			timestamp: Date.now()
		})
	}).catch(() => {});
	// #endregion

	const $ = cheerio.load(html);
	const anchors = $('.group\\/post-wrapper a[href*="/s/pornvideo/"]').toArray();

	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/16f07aa8-3f43-4715-b7c6-4ddfc723f257', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'H6',
			location: 'kone.ts:parseKone',
			message: 'anchor nodes found',
			data: { count: anchors.length },
			timestamp: Date.now()
		})
	}).catch(() => {});
	// #endregion

	const results: KonePost[] = [];
	const seen = new Set<string>();
	for (const el of anchors) {
		const a = $(el);
		const href = a.attr('href') ?? '';
		let url: string | null = null;
		let sourceId: string | null = null;

		try {
			const abs = new URL(href, KONE_BASE);
			url = abs.href;
			const parts = abs.pathname.split('/').filter(Boolean);
			if (parts.length >= 3 && parts[0] === 's' && parts[1] === 'pornvideo') {
				sourceId = parts[2];
			} else {
				sourceId = parts[parts.length - 1] ?? null;
			}
		} catch {
			// ignore malformed href
		}

		const titleAttr = normalizeText(a.attr('title'));
		const titleText = normalizeText(a.text());
		const title = titleAttr || titleText;

		if (!sourceId || !title) {
			console.warn('[kone] skip item missing id/title', { sourceId, title });
			continue;
		}
		if (seen.has(sourceId)) continue;
		seen.add(sourceId);

		let postedAt: string | null = null;
		const parent = a.closest('.group\\/post-wrapper');
		if (parent.length) {
			const dateNode = parent
				.find('div')
				.filter((_, div) => {
					const text = normalizeText($(div).text());
					return /^\d{2}\.\d{2}$/.test(text);
				})
				.first();
			if (dateNode.length) {
				postedAt = normalizeText(dateNode.text());
			}
		}

		results.push({
			site: 'kone',
			sourceId,
			title,
			url,
			thumbnail: null,
			postedAt
		});
	}

	console.info('[kone] parsed posts', results.length);
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/16f07aa8-3f43-4715-b7c6-4ddfc723f257', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sessionId: 'debug-session',
			runId: 'run1',
			hypothesisId: 'H3',
			location: 'kone.ts:parseKone',
			message: 'parse success',
			data: {
				count: results.length,
				first: results[0] ? { sourceId: results[0].sourceId, title: results[0].title } : null
			},
			timestamp: Date.now()
		})
	}).catch(() => {});
	// #endregion
	return results;
}

export async function saveKonePosts(posts: KonePost[], db: App.Locals['db']) {
	if (!db) throw new Error('Database not available');

	for (const post of posts) {
		await db
			.insert(weekly_check_posts)
			.values({
				site: post.site,
				sourceId: post.sourceId,
				title: post.title,
				url: post.url ?? undefined,
				thumbnail: post.thumbnail ?? undefined,
				postedAt: post.postedAt ?? undefined
			})
			.onConflictDoUpdate({
				target: [weekly_check_posts.site, weekly_check_posts.sourceId],
				set: {
					title: post.title,
					url: post.url ?? weekly_check_posts.url,
					thumbnail: post.thumbnail,
					postedAt: post.postedAt ?? sql`NULL`
				}
			});
	}
}

export async function saveKoneState(
	db: App.Locals['db'],
	state: Partial<typeof weekly_check_scraper_state.$inferInsert>
) {
	if (!db) throw new Error('Database not available');
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'kone',
			targetUrl: state.targetUrl ?? 'manual-html',
			status: state.status ?? 'idle',
			message: state.message,
			lastRun: state.lastRun ?? sql`(strftime('%s', 'now'))`
		})
		.onConflictDoUpdate({
			target: weekly_check_scraper_state.site,
			set: {
				targetUrl: state.targetUrl ?? weekly_check_scraper_state.targetUrl,
				status: state.status ?? weekly_check_scraper_state.status,
				message: state.message ?? weekly_check_scraper_state.message,
				lastRun: state.lastRun ?? weekly_check_scraper_state.lastRun
			}
		});
}
