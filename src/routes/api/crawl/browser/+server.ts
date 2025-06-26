import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import Cloudflare from 'cloudflare';
import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';
import { hitomi_history, new_item_list } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

// 상수 정의
const CRAWL_CONFIG = {
	MAX_PAGES: 5,
	MAX_RETRIES: 3,
	RETRY_DELAY_MS: 1000,
	HISTORY_LIMIT: 500,
	BASE_URL: 'https://e-hentai.org',
	SEARCH_PARAMS: 'f_search=korean&f_srdd=3'
} as const;

// 타입 정의
interface CrawlItem {
	code: string;
	name: string;
	type: string;
	url: string;
}

// 로그 유틸리티 함수
function logWithTimestamp(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] [${level}] ${message}`);
}

function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;

	logWithTimestamp(`${context} - 에러: ${errorMessage}`, 'ERROR');

	if (additionalInfo) {
		logWithTimestamp(`추가 정보: ${JSON.stringify(additionalInfo)}`, 'ERROR');
	}

	if (stack) {
		logWithTimestamp(`스택 트레이스: ${stack}`, 'ERROR');
	}
}

// 데이터베이스에서 히스토리 조회
async function getHitomiHistory(db: ReturnType<typeof drizzle>): Promise<Set<string>> {
	try {
		logWithTimestamp('히토미 히스토리 조회 중...');
		const startTime = Date.now();

		const history = await db
			.select({ code: hitomi_history.code })
			.from(hitomi_history)
			.orderBy(desc(hitomi_history.createdAt))
			.limit(CRAWL_CONFIG.HISTORY_LIMIT);

		const queryTime = Date.now() - startTime;
		const historySet = new Set(history.map((item) => item.code));

		logWithTimestamp(`히스토리 조회 완료 - ${historySet.size}개 항목, 조회 시간: ${queryTime}ms`);

		return historySet;
	} catch (error) {
		logError('히토미 히스토리 조회 실패', error);
		throw new Error('데이터베이스 조회 실패');
	}
}

// 유틸리티 함수: 지연 시간 추가
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// URL 생성 함수
function buildCrawlUrl(pageIndex: number, cursor?: string): string {
	const baseUrl = `${CRAWL_CONFIG.BASE_URL}/?${CRAWL_CONFIG.SEARCH_PARAMS}`;
	const finalUrl = pageIndex === 0 ? baseUrl : `${baseUrl}&next=${cursor}`;

	logWithTimestamp(`페이지 ${pageIndex + 1} URL 생성: ${finalUrl}`);
	return finalUrl;
}

// 페이지에서 아이템 추출
function extractItemsFromPage($: cheerio.CheerioAPI, historySet: Set<string>): CrawlItem[] {
	const items: CrawlItem[] = [];

	logWithTimestamp('페이지에서 아이템 추출 시작');

	// DOM 구조 확인을 위한 로깅
	const tableRows = $('table tbody tr');
	logWithTimestamp(`찾은 테이블 행 수: ${tableRows.length}`);

	if (tableRows.length === 0) {
		logWithTimestamp('테이블 행을 찾을 수 없음. 페이지 구조가 변경되었을 가능성', 'WARN');

		// 페이지 내용 일부 로깅 (디버깅용)
		const pageTitle = $('title').text();
		const bodyText = $('body').text().substring(0, 500);
		logWithTimestamp(`페이지 제목: ${pageTitle}`);
		logWithTimestamp(`페이지 내용 (첫 500자): ${bodyText}`);
	}

	tableRows.each((index, element) => {
		try {
			// 첫 두 행은 헤더이므로 건너뜀
			if (index <= 1) return;

			const categoryElement = $(element).find('.gl1c.glcat');
			const category = categoryElement.text().trim();

			if (!category) {
				logWithTimestamp(`행 ${index}: 카테고리를 찾을 수 없음`, 'WARN');
				return;
			}

			const itemElement = $(element).find('.gl3c.glname');
			const linkElement = itemElement.find('a');
			const nameElement = itemElement.find('.glink');

			const link = linkElement.attr('href');
			const name = nameElement.text().trim();

			if (!link || !name) {
				logWithTimestamp(
					`행 ${index}: 링크 또는 이름을 찾을 수 없음 - 링크: ${!!link}, 이름: ${!!name}`,
					'WARN'
				);
				return;
			}

			const code = link.split('/').reverse()[2];
			if (!code) {
				logWithTimestamp(`행 ${index}: 코드 추출 실패 - 링크: ${link}`, 'WARN');
				return;
			}

			if (historySet.has(code)) {
				logWithTimestamp(`행 ${index}: 이미 히스토리에 존재하는 코드: ${code}`);
				return;
			}

			const item: CrawlItem = {
				code,
				name,
				type: category,
				url: link
			};

			items.push(item);
			logWithTimestamp(
				`행 ${index}: 아이템 추가 - 코드: ${code}, 이름: ${name.substring(0, 50)}...`
			);
		} catch (error) {
			logError(`아이템 처리 중 오류 (행 ${index})`, error);
		}
	});

	logWithTimestamp(`페이지에서 ${items.length}개 아이템 추출 완료`);
	return items;
}

// 데이터베이스에 아이템들 저장
async function saveItemsToDatabase(
	db: ReturnType<typeof drizzle>,
	items: CrawlItem[]
): Promise<{ savedCount: number; failedCount: number; failedItems: CrawlItem[] }> {
	if (items.length === 0) {
		logWithTimestamp('저장할 아이템이 없음');
		return { savedCount: 0, failedCount: 0, failedItems: [] };
	}

	const CHUNK_SIZE = 50;
	const totalChunks = Math.ceil(items.length / CHUNK_SIZE);

	let savedCount = 0;
	let failedCount = 0;
	const failedItems: CrawlItem[] = [];

	logWithTimestamp(`=== 데이터베이스 저장 시작 ===`);
	logWithTimestamp(`총 ${items.length}개 항목을 ${totalChunks}개 청크로 분할하여 저장`);

	// 청크 단위로 처리
	for (let i = 0; i < totalChunks; i++) {
		const start = i * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, items.length);
		const chunk = items.slice(start, end);

		logWithTimestamp(`청크 ${i + 1}/${totalChunks} 저장 중... (${chunk.length}개 항목)`);

		try {
			const saveStartTime = Date.now();

			// new_item_list에 저장
			await db.insert(new_item_list).values(chunk);
			// hitomi_history에 저장
			await db.insert(hitomi_history).values(chunk);

			const saveTime = Date.now() - saveStartTime;
			savedCount += chunk.length;

			logWithTimestamp(
				`청크 ${i + 1} 저장 성공 - ${chunk.length}개 항목, 저장 시간: ${saveTime}ms`
			);
		} catch (error) {
			logError(`청크 ${i + 1} 저장 실패`, error, { chunkSize: chunk.length, chunkIndex: i });

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
				} catch (individualError) {
					logError(`개별 아이템 저장 실패`, individualError, { code: item.code, name: item.name });
				}
			}
			logWithTimestamp(
				`청크 ${i + 1} 개별 재시도 완료: ${individualSavedCount}/${chunk.length}개 성공`
			);
		}

		// 각 청크 처리 후 짧은 대기 (DB 부하 방지)
		if (i < totalChunks - 1) {
			await new Promise((resolve) => setTimeout(resolve, 200));
		}
	}

	logWithTimestamp(`=== 데이터베이스 저장 완료 ===`);
	logWithTimestamp(`저장 결과: ${savedCount}개 성공, ${failedCount}개 실패`);

	return { savedCount, failedCount, failedItems };
}

// 단일 페이지 크롤링 (Browser Rendering 사용)
async function crawlSinglePage(
	client: Cloudflare,
	accountId: string,
	pageIndex: number,
	cursor: string | undefined,
	historySet: Set<string>
): Promise<{ items: CrawlItem[]; nextCursor?: string }> {
	try {
		logWithTimestamp(`=== 페이지 ${pageIndex + 1} 크롤링 시작 ===`);

		const url = buildCrawlUrl(pageIndex, cursor);

		logWithTimestamp(`Browser Rendering 요청 시작: ${url}`);
		const renderStartTime = Date.now();

		const content = await client.browserRendering.content.create({
			account_id: accountId,
			url: url
		});

		const renderTime = Date.now() - renderStartTime;
		logWithTimestamp(`Browser Rendering 완료 - 렌더링 시간: ${renderTime}ms`);

		if (!content) {
			throw new Error('Browser Rendering에서 HTML을 가져올 수 없습니다.');
		}

		logWithTimestamp('HTML 파싱 시작');
		const $ = cheerio.load(content);

		const items = extractItemsFromPage($, historySet);
		logWithTimestamp(`페이지 ${pageIndex + 1} 크롤링 완료 - ${items.length}개 새로운 항목`);

		// 다음 페이지 커서 설정
		const nextCursor = items.length > 0 ? items[items.length - 1].code : undefined;
		logWithTimestamp(`다음 페이지 커서: ${nextCursor || '없음'}`);

		return { items, nextCursor };
	} catch (error) {
		logError(`페이지 ${pageIndex + 1} 크롤링 실패`, error, { pageIndex, cursor });
		return { items: [] };
	}
}

// 모든 페이지 크롤링 (Browser Rendering 사용)
async function crawlAllPages(
	client: Cloudflare,
	accountId: string,
	historySet: Set<string>
): Promise<CrawlItem[]> {
	const allItems: CrawlItem[] = [];
	let cursor: string | undefined;

	logWithTimestamp(`=== 전체 크롤링 시작 (최대 ${CRAWL_CONFIG.MAX_PAGES}페이지) ===`);

	for (let pageIndex = 0; pageIndex < CRAWL_CONFIG.MAX_PAGES; pageIndex++) {
		const { items, nextCursor } = await crawlSinglePage(
			client,
			accountId,
			pageIndex,
			cursor,
			historySet
		);

		if (items.length === 0) {
			logWithTimestamp(`페이지 ${pageIndex + 1}에서 새로운 항목이 없어 크롤링 종료`);
			break;
		}

		allItems.push(...items);
		cursor = nextCursor;

		logWithTimestamp(`현재까지 수집된 총 항목 수: ${allItems.length}`);

		// 각 페이지 요청 사이에 짧은 지연 (API 부하 방지)
		if (pageIndex < CRAWL_CONFIG.MAX_PAGES - 1 && items.length > 0) {
			await delay(CRAWL_CONFIG.RETRY_DELAY_MS);
		}
	}

	logWithTimestamp(`전체 크롤링 완료 - 총 ${allItems.length}개 항목 수집`);
	return allItems;
}

export const GET: RequestHandler = async ({ platform }) => {
	// 로컬 환경에서는 크롤링을 수행하지 않음
	if (dev) {
		logWithTimestamp('로컬 환경에서는 Browser Rendering 크롤링이 비활성화되어 있습니다.');
		return json({
			success: false,
			message: '로컬 환경에서는 Browser Rendering 크롤링이 지원되지 않습니다.',
			crawledCount: 0,
			savedCount: 0,
			failedCount: 0,
			executionTime: 0,
			itemList: [],
			failedItems: []
		});
	}

	const startTime = Date.now();

	// 프로덕션 환경: Cloudflare Workers 환경
	logWithTimestamp('프로덕션 환경에서 실행 중...');

	if (!platform?.env) {
		return error(500, '환경 변수에 접근할 수 없습니다.');
	}

	const {
		SECRET_BROWSER_RENDERING_TOKEN: secretToken,
		SECRET_CLOUDFLARE_ACCOUNT_ID: secretAccountId,
		DB: database
	} = platform.env;

	if (!secretToken || !secretAccountId) {
		return error(500, 'Cloudflare 환경 변수가 설정되지 않았습니다.');
	}

	if (!database) {
		return error(500, '데이터베이스 환경 변수가 설정되지 않았습니다.');
	}

	const db = drizzle(database);

	// Cloudflare Workers KV에서 실제 값 가져오기
	const token = await secretToken.get('CLOUDFLARE_BROWSER_RENDERING_TOKEN');
	const accountId = await secretAccountId.get('CLOUDFLARE_ACCOUNT_ID');

	if (!token || !accountId) {
		return error(500, 'Cloudflare API 토큰 또는 계정 ID를 가져올 수 없습니다.');
	}

	try {
		logWithTimestamp('=== Browser Rendering 크롤링 프로세스 시작 ===');

		const client = new Cloudflare({
			apiToken: token ?? ''
		});

		// 1. 히스토리 조회
		const historySet = await getHitomiHistory(db);

		// 2. 모든 페이지 크롤링 (Browser Rendering 사용)
		const itemList = await crawlAllPages(client, accountId ?? '', historySet);

		// 3. 데이터베이스에 저장
		const saveResult = await saveItemsToDatabase(db, itemList);

		const totalTime = Date.now() - startTime;

		logWithTimestamp('=== Browser Rendering 크롤링 프로세스 완료 ===');
		logWithTimestamp(`총 실행 시간: ${totalTime}ms`);
		logWithTimestamp(`수집된 항목: ${itemList.length}개`);
		logWithTimestamp(`저장 성공: ${saveResult.savedCount}개`);
		logWithTimestamp(`저장 실패: ${saveResult.failedCount}개`);

		return json({
			success: true,
			crawledCount: itemList.length,
			savedCount: saveResult.savedCount,
			failedCount: saveResult.failedCount,
			executionTime: totalTime,
			itemList,
			failedItems: saveResult.failedItems,
			message: `Browser Rendering 크롤링이 완료되었습니다. ${itemList.length}개 수집, ${saveResult.savedCount}개 저장 성공, ${saveResult.failedCount}개 저장 실패`
		});
	} catch (err) {
		const totalTime = Date.now() - startTime;

		logError('Browser Rendering 크롤링 중 오류', err, {
			executionTime: totalTime
		});

		return error(500, 'Browser rendering 크롤링 중 오류가 발생했습니다.');
	}
};
