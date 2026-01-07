import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export type KonePost = {
	site: 'kone';
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

const JSON_BLOCK_PATTERN = /'25:T4e94,\[(.*?)\]26:/s;

function safeParseJsonArray(text: string): unknown[] {
	try {
		return JSON.parse(text);
	} catch {
		return [];
	}
}

export function parseKone(html: string): KonePost[] {
	const match = html.match(JSON_BLOCK_PATTERN);
	if (!match) return [];

	const jsonText = `[${match[1]}]`;
	const rawItems = safeParseJsonArray(jsonText);

	if (!Array.isArray(rawItems)) return [];

	return rawItems
		.map((item) => {
			if (!item || typeof item !== 'object') return null;
			const obj = item as Record<string, any>;
			const id = obj.id?.v ?? obj.id ?? obj.sourceId;
			const title = obj.title as string | undefined;
			const preview = obj.preview as string | undefined;
			const createdAt = obj.created_at?.v ?? obj.created_at;

			if (!id || !title) return null;

			return {
				site: 'kone' as const,
				sourceId: String(id),
				title: title.trim(),
				url: null,
				thumbnail: preview ?? null,
				postedAt: createdAt ? String(createdAt) : null
			};
		})
		.filter((v): v is KonePost => Boolean(v));
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

