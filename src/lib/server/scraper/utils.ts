import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export type WeeklySite = 'kissav' | 'missav' | 'twidouga' | 'torrentbot' | 'kone';

export type WeeklyPostInput = {
	site: WeeklySite;
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

export const normalizeSpaces = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() ?? '';

export const nowEpochSeconds = () => Math.floor(Date.now() / 1000);

export async function upsertWeeklyPosts(db: App.Locals['db'], posts: WeeklyPostInput[]) {
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

export async function upsertScraperState(
	db: App.Locals['db'],
	site: WeeklySite,
	state: Partial<typeof weekly_check_scraper_state.$inferInsert>
) {
	if (!db) throw new Error('Database not available');
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site,
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

