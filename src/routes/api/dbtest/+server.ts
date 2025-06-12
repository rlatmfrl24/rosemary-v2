import { hitomi_history } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/d1";

export async function GET(context) {
	try {
		// @ts-expect-error - DB is not defined in the platform
		const db = drizzle(context.platform?.env.DB);
		const result = await db.select().from(hitomi_history);
		return json(result);
	} catch (error) {
		return json(
			{ error: "Database not found", detail: error },
			{ status: 500 },
		);
	}
}
