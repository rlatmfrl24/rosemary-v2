// /api/crawl

import { hitomi_history, new_item_list } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';

// 상수 정의
const CRAWL_CONFIG = {
	MAX_PAGES: 5,
	MAX_RETRIES: 3,
	RETRY_DELAY_MS: 1000,
	HISTORY_LIMIT: 500,
	BASE_URL: 'https://e-hentai.org',
	SEARCH_PARAMS: 'f_search=korean&f_srdd=3'
} as const;

const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// 타입 정의
interface CrawlItem {
	code: string;
	name: string;
	type: string;
	url: string;
}

// 유틸리티 함수: 지연 시간 추가
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// HTTP 요청 함수 (개선된 버전)
async function fetchWithRetry(
	url: string,
	maxRetries = CRAWL_CONFIG.MAX_RETRIES
): Promise<Response> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': USER_AGENT }
			});

			if (response.ok) {
				return response;
			}

			throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
		} catch (error) {
			lastError = error;

			// 마지막 시도가 아니면 대기 후 재시도
			if (attempt < maxRetries) {
				const delayTime = CRAWL_CONFIG.RETRY_DELAY_MS * attempt;
				console.log(`요청 실패, ${delayTime}ms 후 재시도... (${attempt}/${maxRetries})`);
				await delay(delayTime);
			}
		}
	}

	throw lastError;
}

// 데이터베이스에서 히스토리 조회
async function getHitomiHistory(db: ReturnType<typeof drizzle>): Promise<Set<string>> {
	try {
		console.log('히토미 히스토리 조회 중...');

		const history = await db
			.select({ code: hitomi_history.code })
			.from(hitomi_history)
			.orderBy(desc(hitomi_history.createdAt))
			.limit(CRAWL_CONFIG.HISTORY_LIMIT);

		const historySet = new Set(history.map((item) => item.code));
		console.log(`히스토리 ${historySet.size}개 항목 로드 완료`);

		return historySet;
	} catch (error) {
		console.error('히토미 히스토리 조회 실패:', error);
		throw new Error('데이터베이스 조회 실패');
	}
}

// URL 생성 함수
function buildCrawlUrl(pageIndex: number, cursor?: string): string {
	const baseUrl = `${CRAWL_CONFIG.BASE_URL}/?${CRAWL_CONFIG.SEARCH_PARAMS}`;
	return pageIndex === 0 ? baseUrl : `${baseUrl}&next=${cursor}`;
}

// 페이지에서 아이템 추출
function extractItemsFromPage($: cheerio.CheerioAPI, historySet: Set<string>): CrawlItem[] {
	const items: CrawlItem[] = [];

	$('table tbody tr').each((index, element) => {
		try {
			// 첫 두 행은 헤더이므로 건너뜀
			if (index <= 1) return;

			const category = $(element).find('.gl1c.glcat').text().trim();
			if (!category) return;

			const itemElement = $(element).find('.gl3c.glname');
			const link = itemElement.find('a').attr('href');
			const name = itemElement.find('.glink').text().trim();

			if (!link || !name) return;

			const code = link.split('/').reverse()[2];
			if (!code || historySet.has(code)) return;

			items.push({
				code,
				name,
				type: category,
				url: link
			});
		} catch (error) {
			console.error(`항목 처리 중 오류 (인덱스 ${index}):`, error);
		}
	});

	return items;
}

// 단일 페이지 크롤링
async function crawlSinglePage(
	pageIndex: number,
	cursor: string | undefined,
	historySet: Set<string>
): Promise<{ items: CrawlItem[]; nextCursor?: string }> {
	try {
		console.log(`\n페이지 ${pageIndex + 1} 크롤링 중...`);

		const url = buildCrawlUrl(pageIndex, cursor);
		const response = await fetchWithRetry(url);
		const html = await response.text();
		const $ = cheerio.load(html);

		const items = extractItemsFromPage($, historySet);
		console.log(`페이지 ${pageIndex + 1}에서 ${items.length}개의 새로운 항목 발견`);

		// 다음 페이지 커서 설정
		const nextCursor = items.length > 0 ? items[items.length - 1].code : undefined;

		return { items, nextCursor };
	} catch (error) {
		console.error(`페이지 ${pageIndex + 1} 크롤링 실패:`, error);
		return { items: [] };
	}
}

// 모든 페이지 크롤링
async function crawlAllPages(historySet: Set<string>): Promise<CrawlItem[]> {
	const allItems: CrawlItem[] = [];
	let cursor: string | undefined;

	for (let pageIndex = 0; pageIndex < CRAWL_CONFIG.MAX_PAGES; pageIndex++) {
		const { items, nextCursor } = await crawlSinglePage(pageIndex, cursor, historySet);

		if (items.length === 0) {
			console.log('더 이상 새로운 항목이 없어 크롤링을 종료합니다.');
			break;
		}

		allItems.push(...items);
		cursor = nextCursor;
	}

	return allItems;
}

// 데이터베이스에 아이템들 저장 (청크 단위 배치 처리)
async function saveItemsToDatabase(
	db: ReturnType<typeof drizzle>,
	items: CrawlItem[]
): Promise<{ savedCount: number; failedCount: number; failedItems: CrawlItem[] }> {
	if (items.length === 0) return { savedCount: 0, failedCount: 0, failedItems: [] };

	// SQLite 변수 제한을 피하기 위해 청크 크기 설정 (각 아이템당 4개 필드이므로 50개씩 처리)
	const CHUNK_SIZE = 50; // 더 작은 청크로 안정성 향상
	const totalChunks = Math.ceil(items.length / CHUNK_SIZE);

	let savedCount = 0;
	let failedCount = 0;
	const failedItems: CrawlItem[] = [];

	console.log(`데이터베이스에 ${items.length}개 항목 저장 중...`);

	// 청크 단위로 처리
	for (let i = 0; i < totalChunks; i++) {
		const start = i * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, items.length);
		const chunk = items.slice(start, end);

		try {
			// new_item_list에 저장
			await db.insert(new_item_list).values(chunk);
			// hitomi_history에 저장
			await db.insert(hitomi_history).values(chunk);

			savedCount += chunk.length;
		} catch {
			console.error(`청크 ${i + 1} 저장 실패, 개별 재시도 중...`);
			failedCount += chunk.length;
			failedItems.push(...chunk);

			// 개별 아이템으로 재시도
			let individualSavedCount = 0;
			for (const item of chunk) {
				try {
					await db.insert(new_item_list).values([item]);
					await db.insert(hitomi_history).values([item]);
					individualSavedCount++;
					savedCount++;
					failedCount--;

					// failedItems에서 성공한 아이템 제거
					const itemIndex = failedItems.findIndex((failed) => failed.code === item.code);
					if (itemIndex !== -1) {
						failedItems.splice(itemIndex, 1);
					}
				} catch {
					console.error(`개별 아이템 저장 실패 (코드: ${item.code})`);
				}
			}
			console.log(`청크 ${i + 1} 재시도 완료: ${individualSavedCount}/${chunk.length}개 성공`);
		}

		// 각 청크 처리 후 짧은 대기 (DB 부하 방지)
		if (i < totalChunks - 1) {
			await delay(200);
		}
	}

	console.log(
		`데이터베이스 저장 완료: ${savedCount}개 성공${failedCount > 0 ? `, ${failedCount}개 실패` : ''}`
	);

	if (failedItems.length > 0) {
		console.log(`저장 실패한 아이템: ${failedItems.length}개`);
	}

	return { savedCount, failedCount, failedItems };
}

// 메인 GET 핸들러
export async function GET(context): Promise<Response> {
	try {
		console.log('크롤링 시작...');
		const db = drizzle(context.platform?.env.DB as D1Database);

		// 1. 히스토리 조회
		const historySet = await getHitomiHistory(db);

		// 2. 모든 페이지 크롤링
		const itemList = await crawlAllPages(historySet);

		// 3. 데이터베이스에 저장
		const saveResult = await saveItemsToDatabase(db, itemList);

		console.log(`크롤링 완료! 총 ${itemList.length}개의 새로운 항목 발견`);
		console.log(`저장 결과: ${saveResult.savedCount}개 성공, ${saveResult.failedCount}개 실패`);

		return json({
			success: true,
			crawledCount: itemList.length,
			savedCount: saveResult.savedCount,
			failedCount: saveResult.failedCount,
			itemList,
			failedItems: saveResult.failedItems,
			message: `크롤링이 완료되었습니다. ${itemList.length}개 수집, ${saveResult.savedCount}개 저장 성공, ${saveResult.failedCount}개 저장 실패`
		});
	} catch (error) {
		console.error('크롤링 중 치명적인 오류:', error);

		return json(
			{
				success: false,
				error: '크롤링 중 오류가 발생했습니다.',
				details: error instanceof Error ? error.message : '알 수 없는 오류'
			},
			{ status: 500 }
		);
	}
}
