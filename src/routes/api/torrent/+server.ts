import { torrent_tracker_history } from '@/lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';

export async function GET(context) {
	const db = drizzle(context.platform?.env.DB as D1Database);
	const result = await db.select().from(torrent_tracker_history);
	return json(result);
}
