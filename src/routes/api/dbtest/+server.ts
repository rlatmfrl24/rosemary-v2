import { hitomi_history } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';

export async function GET(context) {
	const db = drizzle(context.platform?.env.DB as D1Database);
	const result = await db.select().from(hitomi_history).orderBy(desc(hitomi_history.createdAt));
	return json(result);
}
