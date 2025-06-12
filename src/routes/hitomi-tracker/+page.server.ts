import { new_item_list } from "@/lib/server/db/schema";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const newItems = await locals.db.select().from(new_item_list).all();
		console.log(newItems);
		return {
			new_item_list: newItems,
		};
	} catch (e) {
		console.error(e);
		return { new_item_list: [] };
	}
};
