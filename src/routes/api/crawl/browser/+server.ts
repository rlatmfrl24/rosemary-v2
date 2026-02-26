import { dev } from '$app/environment';
import { runHitomiCrawl } from '$lib/server/hitomi-tracker/crawl-core';
import { json, type RequestHandler } from '@sveltejs/kit';
import Cloudflare from 'cloudflare';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function renderPageWithRetry(
	client: Cloudflare,
	accountId: string,
	url: string,
	debug: boolean
): Promise<string> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			if (debug) console.log(`[hitomi-crawl:debug] browser attempt=${attempt} url=${url}`);
			const content = await client.browserRendering.content.create({
				account_id: accountId,
				url
			});

			if (!content) {
				throw new Error('Browser Rendering returned empty content');
			}
			return content;
		} catch (error) {
			lastError = error;
			if (attempt < MAX_RETRIES) {
				await sleep(RETRY_DELAY_MS * attempt);
			}
		}
	}

	throw lastError instanceof Error ? lastError : new Error('browser retries exhausted');
}

export const GET: RequestHandler = async ({ platform, request }) => {
	if (dev) {
		return json(
			{
				success: false,
				error: '로컬 환경에서는 Browser Rendering 크롤링이 지원되지 않습니다.',
				details: 'Run this endpoint in Cloudflare Workers',
				crawledCount: 0,
				savedCount: 0,
				failedCount: 0,
				executionTime: 0,
				itemList: [],
				failedItems: []
			},
			{
				status: 400,
				headers: {
					'Cache-Control': 'no-store'
				}
			}
		);
	}

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

	const secretToken = platform.env.SECRET_BROWSER_RENDERING_TOKEN;
	const secretAccountId = platform.env.SECRET_CLOUDFLARE_ACCOUNT_ID;
	if (!secretToken || !secretAccountId) {
		return json(
			{
				success: false,
				error: 'Cloudflare Browser Rendering 시크릿이 설정되지 않았습니다.',
				details: 'Missing secret store bindings',
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

	const [token, accountId] = await Promise.all([
		secretToken.get('CLOUDFLARE_BROWSER_RENDERING_TOKEN'),
		secretAccountId.get('CLOUDFLARE_ACCOUNT_ID')
	]);
	if (!token || !accountId) {
		return json(
			{
				success: false,
				error: 'Cloudflare Browser Rendering 인증 정보를 읽지 못했습니다.',
				details: 'Token or accountId not found in secret store',
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

	const client = new Cloudflare({ apiToken: token });
	const debug = platform.env.DEBUG_HITOMI_CRAWL === '1';
	const result = await runHitomiCrawl({
		d1: platform.env.DB,
		request,
		modeLabel: 'Browser Rendering',
		debug,
		fetchPage: (url) => renderPageWithRetry(client, accountId, url, debug)
	});

	return json(result.body, {
		status: result.status,
		headers: result.headers
	});
};
