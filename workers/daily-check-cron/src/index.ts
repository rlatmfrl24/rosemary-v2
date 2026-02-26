export interface Env {
	DAILY_CHECK_DISPATCH_URL: string;
	DAILY_CHECK_CRON_TOKEN: string;
}

const DISPATCH_TIMEOUT_MS = 30_000;

async function dispatchDailyCheck(env: Env): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);
	try {
		return await fetch(env.DAILY_CHECK_DISPATCH_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.DAILY_CHECK_CRON_TOKEN}`,
				Accept: 'application/json'
			},
			signal: controller.signal
		});
	} finally {
		clearTimeout(timeout);
	}
}

export default {
	async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		ctx.waitUntil(
			(async () => {
				const response = await dispatchDailyCheck(env);
				if (!response.ok) {
					const body = await response.text().catch(() => '');
					console.error('[daily-check-cron] dispatch failed', response.status, body);
				}
			})()
		);
	},

	async fetch(_request: Request, env: Env): Promise<Response> {
		const response = await dispatchDailyCheck(env);
		const body = await response.text().catch(() => '');
		return new Response(body || `status=${response.status}`, {
			status: response.status,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
};
