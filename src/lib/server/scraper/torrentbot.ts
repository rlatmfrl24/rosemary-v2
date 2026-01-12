import * as cheerio from 'cheerio';
import type { Post } from '$lib/server/services/weekly-check';

const TORRENTBOT_BASE = 'https://torrentbot.com';

function normalizeSpaces(value?: string | null) {
	return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function resolveUrl(href?: string | null): string | null {
	if (!href) return null;
	try {
		const url = new URL(href, TORRENTBOT_BASE);
		// 상대 경로 그대로 보존 (도메인은 제외)
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return null;
	}
}

function extractSourceId(href?: string | null): string | null {
	if (!href) return null;
	try {
		const url = new URL(href, TORRENTBOT_BASE);
		const parts = url.pathname.split('/').filter(Boolean);
		return parts[parts.length - 1] ?? null;
	} catch {
		const parts = href.split('/').filter(Boolean);
		return parts[parts.length - 1] ?? null;
	}
}

function formatPostedAt(raw?: string | null): string | null {
	const text = normalizeSpaces(raw);
	if (!text) return null;

	// Expecting MM.DD 형태. 실패 시 원본 반환.
	const match = text.match(/^(\d{2})\.(\d{2})$/);
	if (!match) return text;

	const month = Number(match[1]);
	const day = Number(match[2]);
	if (!Number.isFinite(month) || !Number.isFinite(day)) return text;

	const now = new Date();
	let year = now.getFullYear();
	let date = new Date(Date.UTC(year, month - 1, day));

	// 미래 날짜로 파싱되면 전년도 기준으로 보정
	if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
		year -= 1;
		date = new Date(Date.UTC(year, month - 1, day));
	}

	if (Number.isNaN(date.getTime())) return text;
	return date.toISOString().slice(0, 10);
}

export function parseTorrentbot(html: string): Post[] {
	const $ = cheerio.load(html);
	const results: Post[] = [];
	const seen = new Set<string>();

	const pushPost = (post: Post) => {
		if (!post.sourceId || !post.title) return;
		if (seen.has(post.sourceId)) return;
		seen.add(post.sourceId);
		results.push(post);
	};

	// 중앙 "인기 TOP20" 표
	const mainRows = $('ul.customer_table > li > ul.td').toArray();

	mainRows.forEach((el) => {
		const row = $(el);
		const link = row.find('li.tit a').first();
		const href = link.attr('href') ?? null;
		const title = normalizeSpaces(link.text());
		const sourceId = extractSourceId(href);
		const url = resolveUrl(href);

		const postedRaw = normalizeSpaces(row.find('li').eq(2).text());
		const postedAt = (formatPostedAt(postedRaw) ?? postedRaw) || null;

		pushPost({
			site: 'torrentbot',
			sourceId: sourceId ?? '',
			title,
			url,
			thumbnail: null,
			postedAt
		});
	});

	// 상단 "해외영화 TOP10" 리스트
	const foreignBox = $('.notice_box')
		.filter((_, el) => {
			const texts = $(el)
				.find('strong')
				.toArray()
				.map((node) => normalizeSpaces($(node).text()))
				.join(' ');
			return texts.includes('해외영화') && texts.includes('TOP10');
		})
		.first();

	const foreignAnchors = foreignBox.find('li.col-md-6 a[href*="/topic/"]').toArray();

	foreignAnchors.forEach((el) => {
		const link = $(el);
		const href = link.attr('href') ?? null;
		const title = normalizeSpaces(link.text());
		const sourceId = extractSourceId(href);
		const url = resolveUrl(href);

		pushPost({
			site: 'torrentbot',
			sourceId: sourceId ?? '',
			title,
			url,
			thumbnail: null,
			postedAt: null
		});
	});

	return results;
}
