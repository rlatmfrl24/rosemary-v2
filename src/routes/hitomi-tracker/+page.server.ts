import { new_item_list } from "@/lib/server/db/schema";
import type { PageServerLoad } from "../$types";
import { drizzle } from "drizzle-orm/d1";

export const load: PageServerLoad = async (context) => {
	try {
		const db = drizzle(context.platform?.env.DB as D1Database);
		const newItems = await db.select().from(new_item_list).all();
		return {
			new_item_list: newItems,
		};
	} catch (e) {
		console.error(e);
		return { new_item_list: [] };
	}
};
