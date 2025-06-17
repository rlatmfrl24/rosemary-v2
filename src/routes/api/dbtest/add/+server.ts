import { new_item_list } from "@/lib/server/db/schema";
import { drizzle } from "drizzle-orm/d1";
import type { RequestEvent } from "@sveltejs/kit";

// test data insert to db new_item_list
export async function GET(context: RequestEvent) {
	const db = drizzle(context.platform?.env.DB as D1Database);

	const data = [
		{ code: "1234567890", name: "test", type: "test", url: "test" },
	];

	await db.insert(new_item_list).values(data);

	return new Response("success");
}
