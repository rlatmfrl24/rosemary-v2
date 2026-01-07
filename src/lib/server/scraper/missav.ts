import * as cheerio from 'cheerio';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export type MissavPost = {
	site: 'missav';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

const MISSAV_BASE = 'https://missav123.to';

function normalizeText(value?: string | null): string {
	return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function extractSourceId(href?: string): string | null {
	if (!href) return null;

	try {
		const url = new URL(href, MISSAV_BASE);
		const parts = url.pathname.split('/').filter(Boolean); // e.g. ['ko', 'v', '<slug>']
		const vIndex = parts.indexOf('v');
		if (vIndex >= 0 && parts.length > vIndex + 1) {
			return parts[vIndex + 1];
		}
		return parts[parts.length - 1] ?? null;
	} catch {
		const parts = href.split('/').filter(Boolean);
		const vIndex = parts.indexOf('v');
		if (vIndex >= 0 && parts.length > vIndex + 1) {
			return parts[vIndex + 1];
		}
		return parts[parts.length - 1] ?? null;
	}
}

export function parseMissav(html: string): MissavPost[] {
	const $ = cheerio.load(html);
	const items = $('.vid-items .item');

	const results: MissavPost[] = [];

	items.each((_, el) => {
		const posterLink = $(el).find('a.poster').first();
		const infoLink = $(el).find('.info .title').first();
		const href = posterLink.attr('href') ?? infoLink.attr('href');
		const sourceId = extractSourceId(href);
		if (!sourceId || !href) return;

		let url: string | null = null;
		try {
			url = new URL(href, MISSAV_BASE).href;
		} catch {
			url = null;
		}
		if (!url) return;

		const rawTitle = normalizeText(infoLink.text()) || normalizeText(posterLink.attr('title'));
		if (!rawTitle) return;

		const thumbImg = $(el).find('.img img').first();
		const thumbnail =
			thumbImg.attr('data-original') ??
			thumbImg.attr('data-src') ??
			thumbImg.attr('data-webp') ??
			thumbImg.attr('src') ??
			null;

		const postedAtText = normalizeText($(el).find('.info .meta div').first().text());
		const postedAt = postedAtText || null;

		results.push({
			site: 'missav',
			sourceId,
			title: rawTitle,
			url,
			thumbnail,
			postedAt
		});
	});

	return results;
}

export async function fetchMissavHtml(targetUrl: string) {
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

export async function scrapeMissav(targetUrl: string, db: App.Locals['db']) {
	if (!db) throw new Error('Database not available');

	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'missav',
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
		const html = await fetchMissavHtml(targetUrl);
		const posts = parseMissav(html);

		if (!posts.length) {
			throw new Error('파싱 결과가 비어 있습니다.');
		}

		// 기존에 저장된 동일 제목을 가진 게시물은 제외하여 중복 저장을 방지한다.
		const existing = await db
			.select({ title: weekly_check_posts.title })
			.from(weekly_check_posts)
			.where(eq(weekly_check_posts.site, 'missav'));
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
			.where(eq(weekly_check_scraper_state.site, 'missav'));

		return { count: uniquePosts.length };
	} catch (error) {
		await db
			.update(weekly_check_scraper_state)
			.set({
				status: 'error',
				message: error instanceof Error ? error.message : 'unknown error',
				lastRun: sql`(strftime('%s', 'now'))`
			})
			.where(eq(weekly_check_scraper_state.site, 'missav'));
		throw error;
	}
}
