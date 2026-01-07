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

	const body = await request.json();

	// Update scraper target URL
	if (typeof body?.site === 'string' && typeof body?.targetUrl === 'string') {
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
		typeof body?.id === 'number' ? body.id : typeof body?.id === 'string' ? Number(body.id) : null;

	if (idNumber !== null && Number.isFinite(idNumber)) {
		const updates: Partial<typeof weekly_check_posts.$inferInsert> = {};
		if ('liked' in body) updates.liked = Boolean(body.liked);
		if ('read' in body) updates.read = Boolean(body.read);

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

