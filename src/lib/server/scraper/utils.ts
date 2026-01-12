import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export type WeeklySite = 'kissav' | 'missav' | 'twidouga' | 'torrentbot' | 'kone';

export type WeeklyPostInput = {
	site: WeeklySite;
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

export const normalizeSpaces = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() ?? '';

export const nowEpochSeconds = () => Math.floor(Date.now() / 1000);

// --- Network helpers ---

const USER_AGENTS = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
];

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRY = 2;
const DEFAULT_BACKOFF_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, abortController: AbortController) {
	const timeout = setTimeout(() => abortController.abort(`timeout ${timeoutMs}ms`), timeoutMs);
	return promise.finally(() => clearTimeout(timeout));
}

export type SafeFetchOptions = {
	method?: string;
	headers?: Record<string, string>;
	body?: BodyInit | null;
	timeoutMs?: number;
	retry?: number;
	backoffMs?: number;
	jitterMs?: number;
	useProxy?: boolean;
	proxyPrefix?: string; // e.g. https://r.jina.ai/
};

function buildProxyUrl(targetUrl: string, proxyPrefix?: string) {
	if (!proxyPrefix) return targetUrl;
	try {
		const url = new URL(targetUrl);
		const prefix = proxyPrefix.endsWith('/') ? proxyPrefix : `${proxyPrefix}/`;
		return `${prefix}${url.protocol}//${url.host}${url.pathname}${url.search}`;
	} catch {
		return targetUrl;
	}
}

export async function safeFetch(
	targetUrl: string,
	{
		method = 'GET',
		headers = {},
		body = null,
		timeoutMs = DEFAULT_TIMEOUT_MS,
		retry = DEFAULT_RETRY,
		backoffMs = DEFAULT_BACKOFF_MS,
		jitterMs = 250,
		useProxy = false,
		proxyPrefix
	}: SafeFetchOptions = {}
): Promise<Response> {
	const finalUrl = useProxy ? buildProxyUrl(targetUrl, proxyPrefix) : targetUrl;
	let attempt = 0;

	while (true) {
		attempt++;
		const controller = new AbortController();
		const ua = USER_AGENTS[attempt % USER_AGENTS.length];

		try {
			const res = await withTimeout(
				fetch(finalUrl, {
					method,
					headers: {
						'User-Agent': ua,
						Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
						'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
						...headers
					},
					body,
					signal: controller.signal
				}),
				timeoutMs,
				controller
			);

			if (res.ok) return res;

			// Retry on 429 / 5xx with backoff
			if ((res.status === 429 || res.status >= 500) && attempt <= retry + 1) {
				const delay = backoffMs * attempt + Math.floor(Math.random() * (jitterMs ?? 0));
				await sleep(delay);
				continue;
			}

			throw new Error(`HTTP ${res.status} ${res.statusText}`);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				if (attempt <= retry + 1) {
					const delay = backoffMs * attempt + Math.floor(Math.random() * (jitterMs ?? 0));
					await sleep(delay);
					continue;
				}
				throw new Error(`Request timeout after ${attempt} attempts`);
			}

			// Network errors: retry limited times
			if (attempt <= retry + 1) {
				const delay = backoffMs * attempt + Math.floor(Math.random() * (jitterMs ?? 0));
				await sleep(delay);
				continue;
			}
			throw err;
		}
	}
}

export async function fetchHtml(targetUrl: string, options?: SafeFetchOptions): Promise<string> {
	const res = await safeFetch(targetUrl, options);
	const contentType = res.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html') && !contentType.includes('text/markdown')) {
		// 일부 프록시는 text/plain/markdown 으로 내려올 수 있음
		if (!contentType.startsWith('text/')) {
			throw new Error(`Unexpected content-type: ${contentType}`);
		}
	}
	return await res.text();
}

export async function upsertWeeklyPosts(db: App.Locals['db'], posts: WeeklyPostInput[]) {
	if (!db) throw new Error('Database not available');

	for (const post of posts) {
		await db
			.insert(weekly_check_posts)
			.values({
				site: post.site,
				sourceId: post.sourceId,
				title: post.title,
				url: post.url ?? undefined,
				thumbnail: post.thumbnail ?? undefined,
				postedAt: post.postedAt ?? undefined
			})
			.onConflictDoUpdate({
				target: [weekly_check_posts.site, weekly_check_posts.sourceId],
				set: {
					title: post.title,
					url: post.url ?? weekly_check_posts.url,
					thumbnail: post.thumbnail,
					postedAt: post.postedAt ?? sql`NULL`
				}
			});
	}
}

export async function upsertScraperState(
	db: App.Locals['db'],
	site: WeeklySite,
	state: Partial<typeof weekly_check_scraper_state.$inferInsert>
) {
	if (!db) throw new Error('Database not available');
	await db
		.insert(weekly_check_scraper_state)
		.values({
			site,
			targetUrl: state.targetUrl ?? 'manual-html',
			status: state.status ?? 'idle',
			message: state.message,
			lastRun: state.lastRun ?? sql`(strftime('%s', 'now'))`
		})
		.onConflictDoUpdate({
			target: weekly_check_scraper_state.site,
			set: {
				targetUrl: state.targetUrl ?? weekly_check_scraper_state.targetUrl,
				status: state.status ?? weekly_check_scraper_state.status,
				message: state.message ?? weekly_check_scraper_state.message,
				lastRun: state.lastRun ?? weekly_check_scraper_state.lastRun
			}
		});
}


