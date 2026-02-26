import { hitomi_history } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as cheerio from 'cheerio';
import { ensureHitomiTrackerInfrastructure } from './infrastructure';

const CRAWL_CONFIG = {
	MAX_PAGES: 5,
	HISTORY_LIMIT: 500,
	BASE_URL: 'https://e-hentai.org',
	SEARCH_PARAMS: 'f_search=korean&f_srdd=3',
	CHUNK_SIZE: 50
} as const;

const RATE_LIMIT_CONFIG = {
	ip: { limit: 2, windowSeconds: 10 * 60 },
	global: { limit: 30, windowSeconds: 60 * 60 }
} as const;

const CRAWL_LOCK_TTL_SECONDS = 15 * 60;
const CRAWL_STATE_KEY = 'global';
const CRAWL_LOCK_KEY = 'global';
const RATE_LIMIT_GLOBAL_KEY = 'global';

export interface CrawlItem {
	code: string;
	name: string;
	type: string;
	url: string;
	createdAt: number;
}

export interface CrawlApiResponsePayload {
	success: boolean;
	message?: string;
	crawledCount: number;
	savedCount: number;
	failedCount: number;
	executionTime: number;
	itemList: CrawlItem[];
	failedItems: CrawlItem[];
	error?: string;
	details?: string;
}

export interface CrawlApiResult {
	status: number;
	headers: Record<string, string>;
	body: CrawlApiResponsePayload;
}

export interface RunCrawlOptions {
	d1: D1Database;
	request: Request;
	fetchPage: (url: string, pageIndex: number) => Promise<string>;
	modeLabel: string;
	debug?: boolean;
}

interface CrawlLockResult {
	acquired: boolean;
	owner?: string;
	retryAfterSeconds?: number;
}

interface SaveResult {
	savedCount: number;
	failedCount: number;
	failedItems: CrawlItem[];
}

function createNoStoreHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
	return {
		'Cache-Control': 'no-store',
		...extraHeaders
	};
}

function nowInSeconds() {
	return Math.floor(Date.now() / 1000);
}

function logInfo(message: string) {
	console.log(`[hitomi-crawl] ${message}`);
}

function logError(message: string, error: unknown) {
	const details = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
	console.error(`[hitomi-crawl] ${message}: ${details}`);
}

function logDebug(enabled: boolean, message: string) {
	if (enabled) {
		console.log(`[hitomi-crawl:debug] ${message}`);
	}
}

function buildCrawlUrl(pageIndex: number, cursor?: string): string {
	const baseUrl = `${CRAWL_CONFIG.BASE_URL}/?${CRAWL_CONFIG.SEARCH_PARAMS}`;
	if (pageIndex === 0 || !cursor) return baseUrl;
	return `${baseUrl}&next=${encodeURIComponent(cursor)}`;
}

function extractCodeFromLink(link: string): string | null {
	const match = link.match(/\/g\/([^/]+)\//);
	if (match?.[1]) return match[1];
	const parts = link.split('/').filter(Boolean);
	if (parts.length < 2) return null;
	return parts[parts.length - 2] ?? null;
}

function extractNextCursor($: cheerio.CheerioAPI): string | undefined {
	const nextHref =
		$('#unext').attr('href') ??
		$('a[rel="next"]').attr('href') ??
		$('a:contains("Next")').attr('href');
	if (!nextHref) return undefined;
	const normalized = nextHref.replace(/&amp;/g, '&');
	const match = normalized.match(/[?&]next=([^&]+)/);
	if (!match?.[1]) return undefined;
	return decodeURIComponent(match[1]);
}

function extractItemsFromPage(
	html: string,
	historySet: Set<string>,
	seenSet: Set<string>,
	timestamp: number,
	debug: boolean
): { items: CrawlItem[]; nextCursor?: string } {
	const $ = cheerio.load(html);
	const rows = $('table tbody tr');
	const items: CrawlItem[] = [];

	logDebug(debug, `rows=${rows.length}`);

	rows.each((index, element) => {
		// 첫 2행은 헤더
		if (index <= 1) return;

		const type = $(element).find('.gl1c.glcat').text().trim();
		const nameContainer = $(element).find('.gl3c.glname');
		const link = nameContainer.find('a').first().attr('href');
		const name = nameContainer.find('.glink').first().text().trim() || nameContainer.text().trim();
		if (!type || !name || !link) return;

		const code = extractCodeFromLink(link);
		if (!code || historySet.has(code) || seenSet.has(code)) return;

		seenSet.add(code);
		items.push({
			code,
			name,
			type,
			url: link,
			createdAt: timestamp
		});
	});

	return { items, nextCursor: extractNextCursor($) };
}

async function getHitomiHistorySet(db: ReturnType<typeof drizzle>): Promise<Set<string>> {
	const rows = await db
		.select({ code: hitomi_history.code })
		.from(hitomi_history)
		.orderBy(desc(hitomi_history.createdAt))
		.limit(CRAWL_CONFIG.HISTORY_LIMIT);
	return new Set(rows.map((row) => row.code));
}

async function crawlAllPages({
	historySet,
	fetchPage,
	debug
}: {
	historySet: Set<string>;
	fetchPage: (url: string, pageIndex: number) => Promise<string>;
	debug: boolean;
}): Promise<CrawlItem[]> {
	const seenSet = new Set<string>();
	const timestamp = nowInSeconds();
	const allItems: CrawlItem[] = [];
	let cursor: string | undefined;

	for (let pageIndex = 0; pageIndex < CRAWL_CONFIG.MAX_PAGES; pageIndex++) {
		const url = buildCrawlUrl(pageIndex, cursor);
		logInfo(`page ${pageIndex + 1} crawl start: ${url}`);

		const html = await fetchPage(url, pageIndex);
		const { items, nextCursor } = extractItemsFromPage(html, historySet, seenSet, timestamp, debug);
		allItems.push(...items);

		logInfo(`page ${pageIndex + 1} crawl done: new=${items.length}, total=${allItems.length}`);

		if (items.length === 0 || !nextCursor) break;
		cursor = nextCursor;
	}

	return allItems;
}

function createHistoryUpsertStatement(d1: D1Database, item: CrawlItem) {
	return d1
		.prepare(
			`INSERT INTO "hitomi-history" ("code", "name", "type", "url", "createdAt")
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT("code") DO UPDATE SET
         "name" = excluded."name",
         "type" = excluded."type",
         "url" = excluded."url",
         "createdAt" = MIN("hitomi-history"."createdAt", excluded."createdAt")`
		)
		.bind(item.code, item.name, item.type, item.url, item.createdAt);
}

function createNewItemUpsertStatement(d1: D1Database, item: CrawlItem) {
	return d1
		.prepare(
			`INSERT INTO "new-item-list" ("code", "name", "type", "url", "createdAt")
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT("code") DO UPDATE SET
         "name" = excluded."name",
         "type" = excluded."type",
         "url" = excluded."url",
         "createdAt" = CASE
           WHEN excluded."createdAt" > "new-item-list"."createdAt" THEN excluded."createdAt"
           ELSE "new-item-list"."createdAt"
         END`
		)
		.bind(item.code, item.name, item.type, item.url, item.createdAt);
}

async function fetchExistingHistoryCodes(d1: D1Database, codes: string[]): Promise<Set<string>> {
	if (codes.length === 0) return new Set();

	const placeholders = codes.map((_, index) => `?${index + 1}`).join(', ');
	const result = await d1
		.prepare(`SELECT "code" FROM "hitomi-history" WHERE "code" IN (${placeholders})`)
		.bind(...codes)
		.all<{ code: string }>();

	return new Set((result.results ?? []).map((row) => row.code));
}

async function saveItemsToDatabase(d1: D1Database, items: CrawlItem[]): Promise<SaveResult> {
	if (items.length === 0) {
		return { savedCount: 0, failedCount: 0, failedItems: [] };
	}

	let savedCount = 0;
	let failedCount = 0;
	const failedItems: CrawlItem[] = [];

	for (let start = 0; start < items.length; start += CRAWL_CONFIG.CHUNK_SIZE) {
		const chunk = items.slice(start, start + CRAWL_CONFIG.CHUNK_SIZE);
		try {
			const existingCodes = await fetchExistingHistoryCodes(
				d1,
				chunk.map((item) => item.code)
			);
			const statements = chunk.flatMap((item) => [
				createHistoryUpsertStatement(d1, item),
				createNewItemUpsertStatement(d1, item)
			]);
			await d1.batch(statements);
			savedCount += chunk.filter((item) => !existingCodes.has(item.code)).length;
		} catch (chunkError) {
			logError('chunk save failed, fallback to item-level retry', chunkError);
			for (const item of chunk) {
				try {
					const existedBefore = (await fetchExistingHistoryCodes(d1, [item.code])).has(item.code);
					await d1.batch([
						createHistoryUpsertStatement(d1, item),
						createNewItemUpsertStatement(d1, item)
					]);
					if (!existedBefore) savedCount += 1;
				} catch (itemError) {
					logError(`item save failed: code=${item.code}`, itemError);
					failedCount += 1;
					failedItems.push(item);
				}
			}
		}
	}

	return { savedCount, failedCount, failedItems };
}

function getClientIp(request: Request): string {
	const cfIp = request.headers.get('CF-Connecting-IP');
	if (cfIp) return cfIp;
	const xff = request.headers.get('X-Forwarded-For');
	if (!xff) return 'unknown';
	const first = xff.split(',')[0]?.trim();
	return first || 'unknown';
}

async function incrementRateLimitWindow({
	d1,
	scope,
	key,
	windowStart,
	now
}: {
	d1: D1Database;
	scope: 'ip' | 'global';
	key: string;
	windowStart: number;
	now: number;
}): Promise<number> {
	await d1
		.prepare(
			`INSERT INTO "hitomi-crawl-rate-limit" ("scope", "key", "windowStart", "count", "updatedAt")
       VALUES (?1, ?2, ?3, 1, ?4)
       ON CONFLICT("scope", "key", "windowStart")
       DO UPDATE SET
         "count" = "hitomi-crawl-rate-limit"."count" + 1,
         "updatedAt" = excluded."updatedAt"`
		)
		.bind(scope, key, windowStart, now)
		.run();

	const row = await d1
		.prepare(
			`SELECT "count" FROM "hitomi-crawl-rate-limit"
       WHERE "scope" = ?1 AND "key" = ?2 AND "windowStart" = ?3
       LIMIT 1`
		)
		.bind(scope, key, windowStart)
		.first<{ count: number }>();

	return row?.count ?? 0;
}

async function cleanupRateLimitRows(d1: D1Database, now: number): Promise<void> {
	const keepSince = now - RATE_LIMIT_CONFIG.global.windowSeconds * 2;
	await d1
		.prepare(`DELETE FROM "hitomi-crawl-rate-limit" WHERE "windowStart" < ?1`)
		.bind(keepSince)
		.run();
}

async function enforceRateLimit(
	d1: D1Database,
	ip: string
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number; details: string }> {
	const now = nowInSeconds();
	await cleanupRateLimitRows(d1, now);

	const ipWindowStart = now - (now % RATE_LIMIT_CONFIG.ip.windowSeconds);
	const ipCount = await incrementRateLimitWindow({
		d1,
		scope: 'ip',
		key: ip,
		windowStart: ipWindowStart,
		now
	});
	if (ipCount > RATE_LIMIT_CONFIG.ip.limit) {
		return {
			ok: false,
			retryAfterSeconds: Math.max(1, ipWindowStart + RATE_LIMIT_CONFIG.ip.windowSeconds - now),
			details: `IP rate limit exceeded: ${RATE_LIMIT_CONFIG.ip.limit}/${RATE_LIMIT_CONFIG.ip.windowSeconds}s`
		};
	}

	const globalWindowStart = now - (now % RATE_LIMIT_CONFIG.global.windowSeconds);
	const globalCount = await incrementRateLimitWindow({
		d1,
		scope: 'global',
		key: RATE_LIMIT_GLOBAL_KEY,
		windowStart: globalWindowStart,
		now
	});
	if (globalCount > RATE_LIMIT_CONFIG.global.limit) {
		return {
			ok: false,
			retryAfterSeconds: Math.max(
				1,
				globalWindowStart + RATE_LIMIT_CONFIG.global.windowSeconds - now
			),
			details: `Global rate limit exceeded: ${RATE_LIMIT_CONFIG.global.limit}/${RATE_LIMIT_CONFIG.global.windowSeconds}s`
		};
	}

	return { ok: true };
}

async function acquireCrawlLock(d1: D1Database): Promise<CrawlLockResult> {
	const owner = crypto.randomUUID();
	const now = nowInSeconds();
	const expiresAt = now + CRAWL_LOCK_TTL_SECONDS;

	const result = await d1
		.prepare(
			`INSERT INTO "hitomi-crawl-lock" ("key", "owner", "lockedAt", "expiresAt")
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT("key") DO UPDATE SET
         "owner" = excluded."owner",
         "lockedAt" = excluded."lockedAt",
         "expiresAt" = excluded."expiresAt"
       WHERE "hitomi-crawl-lock"."expiresAt" <= excluded."lockedAt"`
		)
		.bind(CRAWL_LOCK_KEY, owner, now, expiresAt)
		.run();

	const changes = Number(result.meta?.changes ?? 0);
	if (changes > 0) return { acquired: true, owner };

	const existing = await d1
		.prepare(`SELECT "expiresAt" FROM "hitomi-crawl-lock" WHERE "key" = ?1 LIMIT 1`)
		.bind(CRAWL_LOCK_KEY)
		.first<{ expiresAt: number }>();

	return {
		acquired: false,
		retryAfterSeconds: Math.max(1, (existing?.expiresAt ?? now + 1) - now)
	};
}

async function releaseCrawlLock(d1: D1Database, owner: string): Promise<void> {
	await d1
		.prepare(`DELETE FROM "hitomi-crawl-lock" WHERE "key" = ?1 AND "owner" = ?2`)
		.bind(CRAWL_LOCK_KEY, owner)
		.run();
}

async function markCrawlRunning(d1: D1Database): Promise<void> {
	const now = nowInSeconds();
	await d1
		.prepare(
			`INSERT INTO "hitomi-crawl-state" (
         "key", "lastStartedAt", "lastStatus", "lastError", "updatedAt"
       )
       VALUES (?1, ?2, 'running', NULL, ?2)
       ON CONFLICT("key") DO UPDATE SET
         "lastStartedAt" = excluded."lastStartedAt",
         "lastStatus" = 'running',
         "lastError" = NULL,
         "updatedAt" = excluded."updatedAt"`
		)
		.bind(CRAWL_STATE_KEY, now)
		.run();
}

async function markCrawlCompleted({
	d1,
	status,
	errorMessage,
	durationMs,
	crawledCount,
	savedCount,
	failedCount
}: {
	d1: D1Database;
	status: 'success' | 'failed';
	errorMessage: string | null;
	durationMs: number;
	crawledCount: number;
	savedCount: number;
	failedCount: number;
}): Promise<void> {
	const now = nowInSeconds();
	await d1
		.prepare(
			`INSERT INTO "hitomi-crawl-state" (
         "key", "lastCompletedAt", "lastStatus", "lastError", "lastDurationMs",
         "lastCrawledCount", "lastSavedCount", "lastFailedCount", "updatedAt"
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?2)
       ON CONFLICT("key") DO UPDATE SET
         "lastCompletedAt" = excluded."lastCompletedAt",
         "lastStatus" = excluded."lastStatus",
         "lastError" = excluded."lastError",
         "lastDurationMs" = excluded."lastDurationMs",
         "lastCrawledCount" = excluded."lastCrawledCount",
         "lastSavedCount" = excluded."lastSavedCount",
         "lastFailedCount" = excluded."lastFailedCount",
         "updatedAt" = excluded."updatedAt"`
		)
		.bind(
			CRAWL_STATE_KEY,
			now,
			status,
			errorMessage,
			durationMs,
			crawledCount,
			savedCount,
			failedCount
		)
		.run();
}

function buildFailurePayload({
	error,
	details,
	executionTime
}: {
	error: string;
	details: string;
	executionTime: number;
}): CrawlApiResponsePayload {
	return {
		success: false,
		error,
		details,
		crawledCount: 0,
		savedCount: 0,
		failedCount: 0,
		executionTime,
		itemList: [],
		failedItems: []
	};
}

export async function runHitomiCrawl({
	d1,
	request,
	fetchPage,
	modeLabel,
	debug = false
}: RunCrawlOptions): Promise<CrawlApiResult> {
	const startedAtMs = Date.now();
	const headers = createNoStoreHeaders();

	try {
		await ensureHitomiTrackerInfrastructure(d1);
		const ip = getClientIp(request);
		const rateLimit = await enforceRateLimit(d1, ip);
		if (!rateLimit.ok) {
			return {
				status: 429,
				headers: createNoStoreHeaders({
					'Retry-After': String(rateLimit.retryAfterSeconds)
				}),
				body: buildFailurePayload({
					error: '요청이 너무 많습니다.',
					details: rateLimit.details,
					executionTime: Date.now() - startedAtMs
				})
			};
		}

		const lock = await acquireCrawlLock(d1);
		if (!lock.acquired || !lock.owner) {
			return {
				status: 409,
				headers: createNoStoreHeaders({
					'Retry-After': String(lock.retryAfterSeconds ?? 1)
				}),
				body: buildFailurePayload({
					error: '이미 크롤링이 진행 중입니다.',
					details: `Retry after ${lock.retryAfterSeconds ?? 1}s`,
					executionTime: Date.now() - startedAtMs
				})
			};
		}

		try {
			await markCrawlRunning(d1);
			const db = drizzle(d1);
			const historySet = await getHitomiHistorySet(db);
			const itemList = await crawlAllPages({
				historySet,
				fetchPage,
				debug
			});
			const saveResult = await saveItemsToDatabase(d1, itemList);
			const executionTime = Date.now() - startedAtMs;

			await markCrawlCompleted({
				d1,
				status: 'success',
				errorMessage: null,
				durationMs: executionTime,
				crawledCount: itemList.length,
				savedCount: saveResult.savedCount,
				failedCount: saveResult.failedCount
			});

			return {
				status: 200,
				headers,
				body: {
					success: true,
					crawledCount: itemList.length,
					savedCount: saveResult.savedCount,
					failedCount: saveResult.failedCount,
					executionTime,
					itemList,
					failedItems: saveResult.failedItems,
					message: `${modeLabel} 크롤링이 완료되었습니다. ${itemList.length}개 수집, ${saveResult.savedCount}개 저장 성공, ${saveResult.failedCount}개 저장 실패`
				}
			};
		} catch (error) {
			const executionTime = Date.now() - startedAtMs;
			const details = error instanceof Error ? error.message : String(error);
			await markCrawlCompleted({
				d1,
				status: 'failed',
				errorMessage: details,
				durationMs: executionTime,
				crawledCount: 0,
				savedCount: 0,
				failedCount: 0
			});
			logError(`${modeLabel} crawl failed`, error);

			return {
				status: 500,
				headers,
				body: buildFailurePayload({
					error: `${modeLabel} 크롤링 중 오류가 발생했습니다.`,
					details,
					executionTime
				})
			};
		} finally {
			try {
				await releaseCrawlLock(d1, lock.owner);
			} catch (releaseError) {
				logError('failed to release crawl lock', releaseError);
			}
		}
	} catch (error) {
		logError(`${modeLabel} crawl guard failed`, error);
		return {
			status: 500,
			headers,
			body: buildFailurePayload({
				error: '크롤링 가드 처리 중 오류가 발생했습니다.',
				details: error instanceof Error ? error.message : String(error),
				executionTime: Date.now() - startedAtMs
			})
		};
	}
}
