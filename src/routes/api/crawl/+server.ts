// /api/crawl

import { hitomi_history, new_item_list } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import * as cheerio from "cheerio";
import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";

export async function GET(context) {
	try {
		console.log("크롤링 시작...");
		const db = drizzle(context.platform?.env.DB as D1Database);

		// get hitomi history from db
		console.log("히토미 히스토리 조회 중...");
		let history: (typeof hitomi_history.$inferSelect)[];
		try {
			history = await db
				.select()
				.from(hitomi_history)
				.orderBy(desc(hitomi_history.createdAt))
				.limit(500);
			console.log(`히스토리 ${history.length}개 항목 로드 완료`);
		} catch (error: unknown) {
			console.error("히토미 히스토리 조회 중 에러 발생:", error);
			throw new Error("데이터베이스 조회 실패");
		}

		// it will crawl from e-hentai and return the json
		const itemList: {
			code: string;
			name: string;
			type: string;
			url: string;
		}[] = [];

		let pageCursor = "";

		for (let page = 0; page < 5; page++) {
			console.log(`\n페이지 ${page + 1} 크롤링 중...`);
			let eh_response: Response;
			try {
				eh_response =
					page === 0
						? await fetch("https://e-hentai.org/?f_search=korean&f_srdd=3")
						: await fetch(
								`https://e-hentai.org/?f_search=korean&f_srdd=3&next=${pageCursor}`,
							);

				if (!eh_response.ok) {
					throw new Error(`HTTP 에러: ${eh_response.status}`);
				}
			} catch (error: unknown) {
				console.error(`페이지 ${page + 1} 크롤링 중 에러 발생:`, error);
				continue; // 다음 페이지로 계속 진행
			}

			let $: cheerio.CheerioAPI;
			try {
				const html = await eh_response.text();
				$ = cheerio.load(html);
			} catch (error: unknown) {
				console.error(`페이지 ${page + 1} HTML 파싱 중 에러 발생:`, error);
				continue;
			}

			let pageItemCount = 0;

			$("table tbody tr").each((index, element) => {
				try {
					if (index > 1) {
						const category = $(element).find(".gl1c.glcat").text();
						const item = $(element).find(".gl3c.glname");
						const link = $(item).find("a").attr("href");
						const code = link !== undefined ? link.split("/").reverse()[2] : "";
						const name = $(item).find(".glink").text();

						if (category !== "") {
							if (history.some((item) => item.code === code)) {
								return;
							}
							const item_data = {
								code: code,
								name: name,
								type: category,
								url: link ?? "",
							};
							itemList.push(item_data);
							pageItemCount++;
						}
					}
				} catch (error: unknown) {
					console.error(
						`항목 처리 중 에러 발생 (페이지 ${page + 1}, 인덱스 ${index}):`,
						error,
					);
				}
			});
			console.log(
				`페이지 ${page + 1}에서 ${pageItemCount}개의 새로운 항목 발견`,
			);

			// get next page cursor that is code of last item in itemList
			const lastItemCode = itemList[itemList.length - 1]?.code;
			if (lastItemCode) {
				pageCursor = lastItemCode;
			} else {
				console.log("더 이상 새로운 항목이 없어 크롤링을 종료합니다.");
				break;
			}
		}

		console.log(`\n총 ${itemList.length}개의 새로운 항목 발견`);
		console.log("데이터베이스에 저장 중...");

		// insert itemList to db
		for (const item of itemList) {
			try {
				await db.insert(new_item_list).values(item);
				await db.insert(hitomi_history).values(item);
			} catch (error: unknown) {
				console.error(`항목 저장 중 에러 발생 (코드: ${item.code}):`, error);
			}
		}

		console.log("크롤링 완료!");
		return json({
			success: true,
			itemList,
			message: "크롤링이 성공적으로 완료되었습니다.",
		});
	} catch (error: unknown) {
		console.error("크롤링 중 치명적인 에러 발생:", error);
		return json(
			{
				success: false,
				error: "크롤링 중 오류가 발생했습니다.",
				details: error instanceof Error ? error.message : "알 수 없는 오류",
			},
			{ status: 500 },
		);
	}
}
