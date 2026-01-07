import { error, json, type RequestHandler } from '@sveltejs/kit';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

type SiteKey = 'kissav' | 'missav' | 'twidouga' | 'torrentbot' | 'kone';

const allowedSites: SiteKey[] = ['kissav', 'missav', 'twidouga', 'torrentbot', 'kone'];

const nowEpoch = () => sql`(strftime('%s', 'now'))`;

const isSiteKey = (value: unknown): value is SiteKey =>
	typeof value === 'string' && allowedSites.includes(value as SiteKey);

const parseBoolean = (value: unknown) =>
	typeof value === 'boolean'
		? value
		: typeof value === 'number'
			? Boolean(value)
			: typeof value === 'string'
				? value === 'true' || value === '1'
				: undefined;

export const GET: RequestHandler = async ({ locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	const posts = await db.select().from(weekly_check_posts).orderBy(desc(weekly_check_posts.createdAt));
	const scraperStates = await db.select().from(weekly_check_scraper_state);

	return json({ posts, scraperStates });
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	const body = (await request.json().catch(() => null)) as unknown;

	const parseTargetUpdate = (value: unknown) => {
		if (
			typeof value !== 'object' ||
			value === null ||
			!isSiteKey((value as { site?: unknown }).site) ||
			typeof (value as { targetUrl?: unknown }).targetUrl !== 'string'
		) {
			return null;
		}
		const targetUrl = (value as { targetUrl: string }).targetUrl.trim();
		if (!targetUrl) return null;
		return { site: (value as { site: SiteKey }).site, targetUrl };
	};

	// Update scraper target URL
	const targetUpdate = parseTargetUpdate(body);
	if (targetUpdate) {
		const [state] = await db
			.insert(weekly_check_scraper_state)
			.values({
				site: targetUpdate.site,
				targetUrl: targetUpdate.targetUrl,
				status: 'idle',
				message: '타겟 업데이트',
				lastRun: nowEpoch()
			})
			.onConflictDoUpdate({
				target: weekly_check_scraper_state.site,
				set: {
					targetUrl: targetUpdate.targetUrl,
					message: '타겟 업데이트',
					lastRun: nowEpoch()
				}
			})
			.returning({
				id: weekly_check_scraper_state.id,
				site: weekly_check_scraper_state.site,
				targetUrl: weekly_check_scraper_state.targetUrl,
				status: weekly_check_scraper_state.status,
				message: weekly_check_scraper_state.message,
				lastRun: weekly_check_scraper_state.lastRun
			});

		return json({ scraperState: state });
	}

	const parsePostUpdate = (value: unknown) => {
		if (typeof value !== 'object' || value === null) return null;

		const rawId = (value as { id?: unknown }).id;
		const id =
			typeof rawId === 'number' ? rawId : typeof rawId === 'string' ? Number(rawId) : undefined;

		if (!Number.isFinite(id)) return null;

		const liked = parseBoolean((value as { liked?: unknown }).liked);
		const read = parseBoolean((value as { read?: unknown }).read);

		const updates: Partial<typeof weekly_check_posts.$inferInsert> = {};
		if (typeof liked !== 'undefined') updates.liked = liked;
		if (typeof read !== 'undefined') updates.read = read;

		if (!Object.keys(updates).length) return null;

		return { id: Number(id), updates };
	};

	const postUpdate = parsePostUpdate(body);
	if (postUpdate) {
		const [updated] = await db
			.update(weekly_check_posts)
			.set(postUpdate.updates)
			.where(eq(weekly_check_posts.id, postUpdate.id))
			.returning({
				id: weekly_check_posts.id,
				site: weekly_check_posts.site,
				sourceId: weekly_check_posts.sourceId,
				title: weekly_check_posts.title,
				url: weekly_check_posts.url,
				thumbnail: weekly_check_posts.thumbnail,
				postedAt: weekly_check_posts.postedAt,
				liked: weekly_check_posts.liked,
				read: weekly_check_posts.read
			});

		if (!updated) throw error(404, 'Post not found');

		return json({ post: updated });
	}

	throw error(400, 'Invalid request payload');
};

export const DELETE: RequestHandler = async ({ locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	// D1 환경에서 트랜잭션 BEGIN 사용이 불가하므로 순차 삭제로 처리
	await db.delete(weekly_check_posts);
	await db.delete(weekly_check_scraper_state);

	return json({ ok: true });
};

