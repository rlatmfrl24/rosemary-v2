import { error, json, type RequestHandler } from '@sveltejs/kit';
import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

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

	const isTargetUpdate = (value: unknown): value is { site: string; targetUrl: string } => {
		return (
			typeof value === 'object' &&
			value !== null &&
			typeof (value as { site?: unknown }).site === 'string' &&
			typeof (value as { targetUrl?: unknown }).targetUrl === 'string'
		);
	};

	// Update scraper target URL
	if (isTargetUpdate(body)) {
		const [state] = await db
			.insert(weekly_check_scraper_state)
			.values({
				site: body.site,
				targetUrl: body.targetUrl,
				status: 'idle',
				message: '타겟 저장',
				lastRun: sql`(strftime('%s', 'now'))`
			})
			.onConflictDoUpdate({
				target: weekly_check_scraper_state.site,
				set: {
					targetUrl: body.targetUrl,
					message: '타겟 업데이트',
					lastRun: sql`(strftime('%s', 'now'))`
				}
			})
			.returning();

		return json({ scraperState: state });
	}

	// Update post flags (liked/read)
	const idNumber =
		typeof (body as { id?: unknown })?.id === 'number'
			? (body as { id: number }).id
			: typeof (body as { id?: unknown })?.id === 'string'
				? Number((body as { id: string }).id)
				: null;

	if (idNumber !== null && Number.isFinite(idNumber)) {
		const updates: Partial<typeof weekly_check_posts.$inferInsert> = {};
		if (typeof (body as { liked?: unknown })?.liked !== 'undefined') {
			updates.liked = Boolean((body as { liked?: unknown }).liked);
		}
		if (typeof (body as { read?: unknown })?.read !== 'undefined') {
			updates.read = Boolean((body as { read?: unknown }).read);
		}

		if (!Object.keys(updates).length) {
			throw error(400, 'No updates provided');
		}

		const [updated] = await db
			.update(weekly_check_posts)
			.set(updates)
			.where(eq(weekly_check_posts.id, idNumber))
			.returning();

		if (!updated) throw error(404, 'Post not found');

		return json({ post: updated });
	}

	throw error(400, 'Invalid request');
};

export const DELETE: RequestHandler = async ({ locals }) => {
	const db = locals.db;
	if (!db) throw error(500, 'Database not available');

	// D1 환경에서 트랜잭션 BEGIN 사용이 불가하므로 순차 삭제로 처리
	await db.delete(weekly_check_posts);
	await db.delete(weekly_check_scraper_state);

	return json({ ok: true });
};

