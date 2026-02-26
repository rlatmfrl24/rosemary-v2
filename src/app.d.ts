// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			db: import('drizzle-orm/d1').DrizzleD1Database<typeof import('$lib/server/db/schema')>;
		}
		interface Platform {
			env: Env & {
				DB: D1Database;
				BROWSER: Fetcher;
				SECRET_BROWSER_RENDERING_TOKEN: SecretStore;
				SECRET_CLOUDFLARE_ACCOUNT_ID: SecretStore;
				DEBUG_HITOMI_CRAWL?: string;
				DAILY_CHECK_CRON_TOKEN?: string;
				VAPID_PUBLIC_KEY?: string;
				VAPID_PRIVATE_KEY?: string;
				WEB_PUSH_SUBJECT?: string;
				APP_BASE_URL?: string;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
