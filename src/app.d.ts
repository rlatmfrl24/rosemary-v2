// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			db: import("drizzle-orm/d1").DrizzleD1Database<
				typeof import("$lib/server/db/schema")
			>;
		}
		interface Platform {
			env: Env & {
				DB: D1Database;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
