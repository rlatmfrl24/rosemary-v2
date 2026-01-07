import * as cheerio from 'cheerio';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export type KissavPost = {
	site: 'kissav';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

const KISSAV_BASE = 'https://kissjav.com';

function extractSourceId(href?: string): string | null {
	if (!href) return null;
	try {
		const url = new URL(href);
		const parts = url.pathname.split('/').filter(Boolean);
		// expected: /video/<id>/<slug>/
		if (parts.length >= 2 && parts[0] === 'video') {
			return parts[1];
		}
		// fallback: last meaningful segment
		return parts[parts.length - 1] ?? null;
	} catch {
		// handle relative URLs without protocol/host
		const parts = href.split('/').filter(Boolean);
		if (parts.length >= 2 && parts[0] === 'video') return parts[1];
		return parts[parts.length - 1] ?? null;
	}
}

export function parseKissav(html: string): KissavPost[] {
	const $ = cheerio.load(html);
	const items = $('#list_videos_common_videos_list_items .thumb');

	const results: KissavPost[] = [];

	items.each((_, el) => {
		const link = $(el).find('a').first();
		const href = link.attr('href');
		const sourceId = extractSourceId(href);
		if (!sourceId || !href) return;

		let url: string | null = null;
		try {
			url = new URL(href, KISSAV_BASE).href;
		} catch {
			url = null;
		}
		if (!url) return;

		const title = link.find('.title').text().trim() || link.attr('title')?.trim();
		if (!title) return;

		const thumbImg = link.find('img').first();
		const thumbnail =
			thumbImg.attr('data-original') ?? thumbImg.attr('data-webp') ?? thumbImg.attr('src') ?? null;

		const postedAt = link.find('.thumb-item-date').text().trim() || null;

		results.push({
			site: 'kissav',
			sourceId,
			title,
			url,
			thumbnail,
			postedAt
		});
	});

	return results;
}

export async function fetchKissavHtml(targetUrl: string) {
	const res = await fetch(targetUrl, {
		headers: {
			'User-Agent': USER_AGENT,
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
		}
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}`);
	}

	return await res.text();
}

export async function scrapeKissav(targetUrl: string, db: App.Locals['db']) {
	if (!db) throw new Error('Database not available');

	// 상태 running
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'kissav',
			targetUrl,
			status: 'running',
			message: 'fetching...',
			lastRun: sql`(strftime('%s', 'now'))`
		})
		.onConflictDoUpdate({
			target: weekly_check_scraper_state.site,
			set: {
				targetUrl,
				status: 'running',
				message: 'fetching...',
				lastRun: sql`(strftime('%s', 'now'))`
			}
		});

	try {
		const html = await fetchKissavHtml(targetUrl);
		const posts = parseKissav(html);

		if (!posts.length) {
			throw new Error('파싱 결과가 비어 있습니다.');
		}

		// 기존 테이블에 동일 제목이 있으면 건너뛰어 중복 저장을 막는다.
		const existing = await db
			.select({ title: weekly_check_posts.title })
			.from(weekly_check_posts)
			.where(eq(weekly_check_posts.site, 'kissav'));
		const seenTitles = new Set(existing.map((row) => row.title));
		const uniquePosts = posts.filter((post) => {
			if (seenTitles.has(post.title)) return false;
			seenTitles.add(post.title);
			return true;
		});

		for (const post of uniquePosts) {
			await db
				.insert(weekly_check_posts)
				.values({
					site: post.site,
					sourceId: post.sourceId,
					title: post.title,
					url: post.url ?? undefined,
					thumbnail: post.thumbnail,
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

		await db
			.update(weekly_check_scraper_state)
			.set({
				status: 'success',
				message: `성공 (신규 ${uniquePosts.length}건)`,
				lastRun: sql`(strftime('%s', 'now'))`
			})
			.where(eq(weekly_check_scraper_state.site, 'kissav'));

		return { count: uniquePosts.length };
	} catch (error) {
		await db
			.update(weekly_check_scraper_state)
			.set({
				status: 'error',
				message: error instanceof Error ? error.message : 'unknown error',
				lastRun: sql`(strftime('%s', 'now'))`
			})
			.where(eq(weekly_check_scraper_state.site, 'kissav'));
		throw error;
	}
}
