import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Drizzle 인스턴스를 생성하는 함수
export const createDb = (d1: D1Database) => drizzle(d1, { schema });

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	) {
		console.log("cron processed");
	},
};
