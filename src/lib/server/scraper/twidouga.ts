import * as cheerio from 'cheerio';
import {
	normalizeSpaces,
	upsertScraperState,
	upsertWeeklyPosts,
	type WeeklyPostInput
} from './utils';

export type TwidougaPost = WeeklyPostInput & { site: 'twidouga' };

function extractTweetId(href?: string | null): string | null {
	if (!href) return null;
	try {
		const url = new URL(href);
		const parts = url.pathname.split('/').filter(Boolean);
		const idx = parts.findIndex((p) => p === 'status');
		if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
		return parts[parts.length - 1] ?? null;
	} catch {
		return null;
	}
}

function extractSourceId(videoUrl?: string | null, tweetId?: string | null) {
	if (tweetId) return tweetId;
	if (!videoUrl) return null;
	try {
		const url = new URL(videoUrl);
		const parts = url.pathname.split('/').filter(Boolean);
		return parts[parts.length - 1] ?? null;
	} catch {
		return null;
	}
}

export function parseTwidouga(html: string): TwidougaPost[] {
	const $ = cheerio.load(html);
	const items = $('.gazou');

	const results: TwidougaPost[] = [];

	items.each((index, el) => {
		const container = $(el);
		const posterLink = container.find('.poster a').first();
		const videoUrl = posterLink.attr('href') ?? null;
		const thumbnail = posterLink.find('img').attr('src') ?? null;

		const tweetLink = container.prevAll('a[href*="x.com"], a[href*="twitter.com"]').first();
		const tweetUrl = tweetLink.attr('href') ?? null;
		const tweetId = extractTweetId(tweetUrl);

		const sourceId = extractSourceId(videoUrl, tweetId);
		if (!sourceId) return;

		// 랭크 텍스트는 바로 앞의 텍스트 노드/IMG 조합에 포함되어 있어 간단히 fallback 제목을 구성한다.
		const rankText =
			container.prevAll().slice(0, 4).text().replace(/\s+/g, ' ').trim() || `rank-${index + 1}`;

		const savesText = normalizeSpaces(tweetLink.parent().text()).match(/(\d+)\s*회저장/);
		const savesLabel = savesText ? `${savesText[1]}회 저장` : '';

		const titleParts = [rankText];
		if (tweetId) titleParts.push(`tweet ${tweetId}`);
		if (savesLabel) titleParts.push(savesLabel);

		results.push({
			site: 'twidouga',
			sourceId: sourceId,
			title: titleParts.join(' • '),
			// 요청된 URL은 X 트윗 링크를 우선 사용하고, 없을 때만 비디오 URL로 대체한다.
			url: tweetUrl ?? videoUrl ?? null,
			thumbnail: thumbnail,
			postedAt: null
		});
	});

	return results;
}

export async function saveTwidougaPosts(posts: TwidougaPost[], db: App.Locals['db']) {
	await upsertWeeklyPosts(db, posts);
}

export async function saveTwidougaState(
	db: App.Locals['db'],
	state: Partial<{
		targetUrl?: string;
		status?: string;
		message?: string | null;
		lastRun?: number | null;
	}>
) {
	await upsertScraperState(db, 'twidouga', state);
}
