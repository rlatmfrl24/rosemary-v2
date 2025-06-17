import { createDb } from "$lib/server/db";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	if (event.platform?.env.DB) {
		event.locals.db = createDb(event.platform.env.DB);
	}
	return resolve(event);
};
