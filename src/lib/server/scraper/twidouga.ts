import * as cheerio from 'cheerio';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export type TwidougaPost = {
	site: 'twidouga';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

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
			container
				.prevAll()
				.slice(0, 4)
				.text()
				.replace(/\s+/g, ' ')
				.trim() || `rank-${index + 1}`;

		const savesText = tweetLink.parent().text().match(/(\d+)\s*회저장/);
		const savesLabel = savesText ? `${savesText[1]}회 저장` : '';

		const titleParts = [rankText];
		if (tweetId) titleParts.push(`tweet ${tweetId}`);
		if (savesLabel) titleParts.push(savesLabel);

		results.push({
			site: 'twidouga',
			sourceId: sourceId,
			title: titleParts.join(' • '),
			url: videoUrl ?? tweetUrl ?? null,
			thumbnail: thumbnail,
			postedAt: null
		});
	});

	return results;
}

export async function saveTwidougaPosts(posts: TwidougaPost[], db: App.Locals['db']) {
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

export async function saveTwidougaState(
	db: App.Locals['db'],
	state: Partial<typeof weekly_check_scraper_state.$inferInsert>
) {
	if (!db) throw new Error('Database not available');
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site: 'twidouga',
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

