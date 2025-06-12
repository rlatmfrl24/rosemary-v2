import { createDb } from "$lib/server/db";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	// event.platform.env.DB는 wrangler.toml의 binding = "DB" 설정에서 옵니다.
	if (event.platform?.env.DB) {
		event.locals.db = createDb(event.platform.env.DB);
	}
	return resolve(event);
};
