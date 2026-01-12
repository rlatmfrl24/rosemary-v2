import * as cheerio from 'cheerio';
import type { Post } from '$lib/server/services/weekly-check';
import { fetchHtml } from './utils';

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

export function parseKissav(html: string): Post[] {
	const $ = cheerio.load(html);
	const items = $('#list_videos_common_videos_list_items .thumb');

	const results: Post[] = [];

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
	return fetchHtml(targetUrl);
}

export async function scrapeKissav(targetUrl: string): Promise<Post[]> {
	const html = await fetchKissavHtml(targetUrl);
	const posts = parseKissav(html);

	if (!posts.length) {
		throw new Error('파싱 결과가 비어 있습니다.');
	}

	return posts;
}
