import { runHitomiCrawl } from '$lib/server/hitomi-tracker/crawl-core';
import { json, type RequestHandler } from '@sveltejs/kit';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPageWithRetry(url: string, debug: boolean): Promise<string> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			if (debug) console.log(`[hitomi-crawl:debug] fetch attempt=${attempt} url=${url}`);
			const response = await fetch(url, {
				headers: {
					'User-Agent': USER_AGENT,
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
					DNT: '1',
					Connection: 'keep-alive'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status} ${response.statusText}`);
			}

			return await response.text();
		} catch (error) {
			lastError = error;
			if (attempt < MAX_RETRIES) {
				await sleep(RETRY_DELAY_MS * attempt);
			}
		}
	}

	throw lastError instanceof Error ? lastError : new Error('fetch retries exhausted');
}

export const GET: RequestHandler = async ({ platform, request }) => {
	if (!platform?.env?.DB) {
		return json(
			{
				success: false,
				error: '데이터베이스가 연결되지 않았습니다.',
				details: 'Missing D1 binding',
				crawledCount: 0,
				savedCount: 0,
				failedCount: 0,
				executionTime: 0,
				itemList: [],
				failedItems: []
			},
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store'
				}
			}
		);
	}

	const debug = platform.env.DEBUG_HITOMI_CRAWL === '1';
	const result = await runHitomiCrawl({
		d1: platform.env.DB,
		request,
		modeLabel: 'Fetch',
		debug,
		fetchPage: (url) => fetchPageWithRetry(url, debug)
	});

	return json(result.body, {
		status: result.status,
		headers: result.headers
	});
};
