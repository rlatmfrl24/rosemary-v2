import * as cheerio from 'cheerio';
import type { Post } from '$lib/server/services/weekly-check';

const KONE_BASE = 'https://kone.gg';

function normalizeSpaces(value?: string | null) {
	return value?.replace(/\s+/g, ' ').trim() ?? '';
}

export function parseKone(html: string): Post[] {
	const $ = cheerio.load(html);
	const anchors = $('.group\\/post-wrapper a[href*="/s/pornvideo/"]').toArray();

	const results: Post[] = [];
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

		const titleAttr = normalizeSpaces(a.attr('title'));
		const titleText = normalizeSpaces(a.text());
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
					const text = normalizeSpaces($(div).text());
					return /^\d{2}\.\d{2}$/.test(text);
				})
				.first();
			if (dateNode.length) {
				postedAt = normalizeSpaces(dateNode.text());
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

	return results;
}
