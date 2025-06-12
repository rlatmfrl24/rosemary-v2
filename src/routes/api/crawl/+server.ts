// /api/crawl

import { hitomi_history, new_item_list } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import * as cheerio from "cheerio";

export async function GET(context) {
	// get hitomi history from db
	const history = await context.locals.db
		.select()
		.from(hitomi_history)
		.limit(200);
	console.log(history);

	// it will crawl from e-hentai and return the json
	const itemList: { code: string; name: string; type: string; url: string }[] =
		[];

	for (let page = 0; page < 5; page++) {
		const eh_response = await fetch(
			`https://e-hentai.org/?f_search=korean&f_srdd=3&range=${page + 1}`,
		);
		const $ = cheerio.load(await eh_response.text());
		$("table tbody tr").each((index, element) => {
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
				}
			}
		});
	}

	// insert itemList to db
	for (const item of itemList) {
		await context.locals.db.insert(new_item_list).values(item);
		await context.locals.db.insert(hitomi_history).values(item);
	}

	return json({ itemList });
}
