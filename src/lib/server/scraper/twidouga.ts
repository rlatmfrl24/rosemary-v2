import * as cheerio from 'cheerio';
import type { Post } from '$lib/server/services/weekly-check';
import { normalizeSpaces } from './utils';

function extractTweetId(href?: string): string | null {
	if (!href) return null;

	const pickId = (value: string) => {
		const match = value.match(/(\d{6,})/);
		return match ? match[1] : null;
	};

	try {
		const url = new URL(href);
		const parts = url.pathname.split('/').filter(Boolean);
		const statusIdx = parts.indexOf('status');
		if (statusIdx >= 0 && parts.length > statusIdx + 1) {
			return pickId(parts[statusIdx + 1]);
		}
		return pickId(parts[parts.length - 1] ?? '');
	} catch {
		const parts = href.split('/').filter(Boolean);
		const statusIdx = parts.indexOf('status');
		if (statusIdx >= 0 && parts.length > statusIdx + 1) {
			return pickId(parts[statusIdx + 1]);
		}
		return pickId(parts[parts.length - 1] ?? '');
	}
}

export function parseTwidouga(html: string): Post[] {
	const $ = cheerio.load(html);
	const posts: Post[] = [];

	const tweetLinks = $('a[href*="x.com"]')
		.filter((_, el) => $(el).text().includes('트윗'))
		.toArray();

	tweetLinks.forEach((el, index) => {
		const $el = $(el);
		const tweetUrl = $el.attr('href');
		const sourceId = extractTweetId(tweetUrl);
		if (!tweetUrl || !sourceId) return;

		const gazou = $el.nextAll('.gazou').first();
		const poster = gazou.find('.poster');

		const videoUrl = poster.find('a').first().attr('href') ?? tweetUrl;
		const thumbnail = poster.find('img').first().attr('src') ?? null;

		const saveTextRaw = (el.next as { data?: string } | null | undefined)?.data ?? '';
		const saveText = normalizeSpaces(saveTextRaw).replace(/^\u00a0+/, ''); // strip &nbsp;

		const titleCore = `[#${index + 1}] [${sourceId}]`;
		const title = saveText ? `${titleCore} ${saveText}` : titleCore;

		posts.push({
			site: 'twidouga',
			sourceId,
			title,
			url: videoUrl,
			thumbnail,
			postedAt: null
		});
	});

	return posts;
}

