import * as cheerio from 'cheerio';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const MISSAV_PROXY_PREFIX = 'https://r.jina.ai/';
const nowSql = () => sql`(strftime('%s', 'now'))`;

export type MissavPost = {
	site: 'missav';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

const MISSAV_BASE = 'https://missav123.to';

const isCloudflareBlock = (html: string) => /html>\s*<head>/.test(html) && /cloudflare/i.test(html);

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

function buildProxyUrl(targetUrl: string) {
	const url = new URL(targetUrl);
	return `${MISSAV_PROXY_PREFIX}http://${url.host}${url.pathname}${url.search}`;
}

export function parseMissavProxy(markdown: string): MissavPost[] {
	const thumbnailByUrl = new Map<string, string>();
	const imageRegex = /\[!\[[^\]]*]\((https?:\/\/[^\s)]+)\)\]\((https?:\/\/[^\s)]+\/v\/[^\s)]+)\)/g;
	for (
		let imageMatch = imageRegex.exec(markdown);
		imageMatch;
		imageMatch = imageRegex.exec(markdown)
	) {
		const [, thumb, videoUrl] = imageMatch;
		thumbnailByUrl.set(videoUrl, thumb);
	}

	const linkRegex = /\[(?!!\[)([^\]]+)\]\((https?:\/\/[^\s)]+\/v\/[^\s)]+)\)/g;
	const posts: MissavPost[] = [];
	for (let linkMatch = linkRegex.exec(markdown); linkMatch; linkMatch = linkRegex.exec(markdown)) {
		const [, rawTitle, videoUrl] = linkMatch;
		const sourceId = extractSourceId(videoUrl);
		if (!sourceId) continue;

		const title = normalizeText(rawTitle);
		if (!title) continue;

		posts.push({
			site: 'missav',
			sourceId,
			title,
			url: videoUrl,
			thumbnail: thumbnailByUrl.get(videoUrl),
			postedAt: null
		});
	}

	return posts;
}

async function upsertMissavState(
	db: App.Locals['db'],
	targetUrl: string,
	state: { status: 'running' | 'success' | 'error'; message?: string | null }
) {
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'missav',
			targetUrl,
			status: state.status,
			message: state.message,
			lastRun: nowSql()
		})
		.onConflictDoUpdate({
			target: weekly_check_scraper_state.site,
			set: {
				targetUrl,
				status: state.status,
				message: state.message ?? weekly_check_scraper_state.message,
				lastRun: nowSql()
			}
		});
}

async function upsertMissavPosts(db: App.Locals['db'], posts: MissavPost[]) {
	if (!posts.length) return 0;

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

	return uniquePosts.length;
}

export async function fetchMissavHtml(targetUrl: string, options?: { useProxy?: boolean }) {
	const url = options?.useProxy ? buildProxyUrl(targetUrl) : targetUrl;
	const res = await fetch(url, {
		headers: {
			'User-Agent': USER_AGENT,
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
			Referer: targetUrl
		}
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}${options?.useProxy ? ' (proxy)' : ''}`);
	}

	return await res.text();
}

export async function scrapeMissav(targetUrl: string, db: App.Locals['db']) {
	if (!db) throw new Error('Database not available');

	await upsertMissavState(db, targetUrl, { status: 'running', message: 'fetching...' });

	try {
		let html = '';
		let posts: MissavPost[] = [];
		let usedProxy = false;

		// 1차: 직접 요청
		try {
			html = await fetchMissavHtml(targetUrl);
			posts = parseMissav(html);
		} catch (fetchErr) {
			html = fetchErr instanceof Error ? fetchErr.message : '';
		}

		// 2차: Cloudflare 차단/파싱 실패 시 프록시로 재시도
		if (!posts.length || isCloudflareBlock(html)) {
			const proxyHtml = await fetchMissavHtml(targetUrl, { useProxy: true });
			posts = parseMissav(proxyHtml);
			if (!posts.length) {
				posts = parseMissavProxy(proxyHtml);
			}
			usedProxy = true;
		}

		if (!posts.length) {
			throw new Error('파싱 결과가 비어 있습니다. (missav)');
		}

		const count = await upsertMissavPosts(db, posts);

		await upsertMissavState(db, targetUrl, {
			status: 'success',
			message: `성공${usedProxy ? '(proxy)' : ''} (신규 ${count}건)`
		});

		return { count };
	} catch (error) {
		await upsertMissavState(db, targetUrl, {
			status: 'error',
			message: error instanceof Error ? error.message : 'unknown error'
		});
		throw error;
	}
}

export async function ingestMissavHtml(html: string, targetUrl: string, db: App.Locals['db']) {
	if (!db) throw new Error('Database not available');
	if (!html.trim()) throw new Error('html is required');

	await upsertMissavState(db, targetUrl, {
		status: 'running',
		message: '정적 HTML 파싱 중'
	});

	try {
		let posts = parseMissav(html);
		if (!posts.length) {
			posts = parseMissavProxy(html);
		}
		if (!posts.length) {
			throw new Error('파싱 결과가 비어 있습니다. (missav)');
		}

		const count = await upsertMissavPosts(db, posts);

		await upsertMissavState(db, targetUrl, {
			status: 'success',
			message: `성공(정적 HTML, 신규 ${count}건)`
		});

		return { count };
	} catch (error) {
		await upsertMissavState(db, targetUrl, {
			status: 'error',
			message: error instanceof Error ? error.message : 'unknown error'
		});
		throw error;
	}
}
