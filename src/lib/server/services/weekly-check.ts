import { weekly_check_posts, weekly_check_scraper_state } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export type Post = {
	site: string;
	sourceId: string;
	title: string;
	url?: string | null;
	thumbnail?: string | null;
	postedAt?: string | null;
};

export type ScraperState = {
	status: 'idle' | 'running' | 'success' | 'error' | 'unsupported';
	message?: string | null;
	targetUrl?: string; // Optional output
};

type PageInfo =
	| { basePage: number; key: 'page' | 'p'; mode: 'query' }
	| { basePage: number; key: 'page'; mode: 'path' };

const nowSql = () => sql`(strftime('%s', 'now'))`;

export class WeeklyCheckService {
	constructor(private db: App.Locals['db']) {}

	async upsertState(site: string, targetUrl: string, state: Omit<ScraperState, 'targetUrl'>) {
		await this.db
			.insert(weekly_check_scraper_state)
			.values({
				site,
				targetUrl,
				status: state.status,
				message: state.message,
				lastRun: nowSql()
			})
			.onConflictDoUpdate({
				target: weekly_check_scraper_state.site,
				set: {
					targetUrl,
					status: state.status,
					message: state.message ?? weekly_check_scraper_state.message,
					lastRun: nowSql()
				}
			});
	}

	async upsertPosts(posts: Post[]) {
		if (!posts.length) return 0;

		const site = posts[0].site;

		// Optional: Optimization to avoid conflict checks for everything
		// Get existing titles for this site to filter duplicates if needed logic requires it
		// But keeping it simple with onConflictDoUpdate is usually fine for SQLite

		let newCount = 0;

		// We do need to count "new" items.
		// Drizzle doesn't return "number of inserted rows" easily with onConflict.
		// So we might check existence first or just return total processed.
		// For accurate "new items" count, we can filter by existence check.

		const existing = await this.db
			.select({ sourceId: weekly_check_posts.sourceId })
			.from(weekly_check_posts)
			.where(eq(weekly_check_posts.site, site));

		const existingIds = new Set(existing.map((r) => r.sourceId));

		const toInsert = [];
		const toUpdate = [];

		for (const post of posts) {
			if (existingIds.has(post.sourceId)) {
				toUpdate.push(post);
			} else {
				toInsert.push(post);
				existingIds.add(post.sourceId); // prevent dupes within the batch
				newCount++;
			}
		}

		// Batch insert new ones (guard for SQLite/D1 var limits)
		if (toInsert.length > 0) {
			const BATCH_SIZE = 10; // ~9 placeholders/row -> 90 per batch to stay safely under D1 limits
			const placeholdersPerRow = 9;

			for (let start = 0; start < toInsert.length; start += BATCH_SIZE) {
				const batch = toInsert.slice(start, start + BATCH_SIZE);
				const placeholderCount = batch.length * placeholdersPerRow;

				try {
					await this.db
						.insert(weekly_check_posts)
						.values(
							batch.map((p) => ({
								site: p.site,
								sourceId: p.sourceId,
								title: p.title,
								url: p.url ?? undefined,
								thumbnail: p.thumbnail,
								postedAt: p.postedAt ?? undefined
							}))
						)
						.onConflictDoUpdate({
							target: [weekly_check_posts.site, weekly_check_posts.sourceId],
							set: {
								title: sql`excluded.title`,
								url: sql`COALESCE(excluded.url, "weekly-check-posts".url)`,
								thumbnail: sql`excluded.thumbnail`,
								postedAt: sql`COALESCE(excluded.postedAt, "weekly-check-posts".postedAt)`
							}
						});
				} catch (err) {
					throw err;
				}
			}
		}

		// Update existing ones (one by one or batched if feasible, but usually loop)
		// For simplicity and correctness with "onConflict" logic we used to have:
		for (const post of toUpdate) {
			await this.db
				.update(weekly_check_posts)
				.set({
					title: post.title,
					url: post.url ?? weekly_check_posts.url,
					thumbnail: post.thumbnail,
					postedAt: post.postedAt ?? weekly_check_posts.postedAt
				})
				.where(
					sql`${weekly_check_posts.site} = ${post.site} AND ${weekly_check_posts.sourceId} = ${post.sourceId}`
				);
		}

		return newCount;
	}

	// Helper to append page number to URL
	private getPageInfo(site: string, url: string): PageInfo {
		// kissav uses path-based pagination: /most-popular/2/?sort=...
		if (site === 'kissav') {
			try {
				const u = new URL(url);
				const segments = u.pathname.split('/').filter(Boolean);
				const last = segments[segments.length - 1];
				const parsed = last && /^\d+$/.test(last) ? Number.parseInt(last, 10) : NaN;
				const basePage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
				return { basePage, key: 'page', mode: 'path' };
			} catch {
				return { basePage: 1, key: 'page', mode: 'path' };
			}
		}

		// missav uses query-based pagination with ?page=2
		if (site === 'missav') {
			try {
				const u = new URL(url);
				const raw = u.searchParams.get('page');
				const parsed = raw ? Number.parseInt(raw, 10) : NaN;
				const basePage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
				return { basePage, key: 'page', mode: 'query' };
			} catch {
				return { basePage: 1, key: 'page', mode: 'query' };
			}
		}

		try {
			const u = new URL(url);
			const hasPage = u.searchParams.has('page');
			const hasP = u.searchParams.has('p');
			const key = (hasPage ? 'page' : hasP ? 'p' : 'page') as 'page' | 'p';
			const raw = hasPage ? u.searchParams.get('page') : hasP ? u.searchParams.get('p') : null;
			const parsed = raw ? Number.parseInt(raw, 10) : NaN;
			const basePage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
			return { basePage, key, mode: 'query' };
		} catch {
			return { basePage: 1, key: 'page', mode: 'query' };
		}
	}

	private appendPageNumber(site: string, url: string, page: number, pageInfo: PageInfo): string {
		if (page <= 1 && pageInfo.basePage === 1) return url;
		const targetPage = Math.max(pageInfo.basePage + (page - 1), 1);

		// kissav path-based pagination
		if (site === 'kissav' && pageInfo.mode === 'path') {
			try {
				const u = new URL(url);
				let segments = u.pathname.split('/').filter(Boolean);

				if (segments.length) {
					const last = segments[segments.length - 1];
					if (/^\d+$/.test(last)) {
						if (targetPage <= 1) {
							segments = segments.slice(0, -1);
						} else {
							segments[segments.length - 1] = targetPage.toString();
						}
					} else if (targetPage > 1) {
						segments.push(targetPage.toString());
					}
				}

				u.pathname = `/${segments.join('/')}/`;
				return u.toString();
			} catch {
				return url;
			}
		}

		// default query-based pagination
		if (pageInfo.mode === 'query') {
			try {
				const u = new URL(url);
				if (targetPage <= 1) {
					u.searchParams.delete(pageInfo.key);
				} else {
					u.searchParams.set(pageInfo.key, targetPage.toString());
				}
				return u.toString();
			} catch {
				return url;
			}
		}
		return url;
	}

	async runScraper(
		site: string,
		targetUrl: string,
		scraperFn: (url: string) => Promise<Post[]>,
		maxPages: number = 1,
		options?: {
			pageDelayMs?: number;
			maxErrors?: number;
			stopOnError?: boolean;
		}
	) {
		await this.upsertState(site, targetUrl, { status: 'running', message: '수집 시작...' });

		let totalNew = 0;
		let errors = 0;
		const pageDelayMs = options?.pageDelayMs ?? 1200;
		const maxErrors = options?.maxErrors ?? 2;
		const stopOnError = options?.stopOnError ?? true;
		const pageInfo = this.getPageInfo(site, targetUrl);

		try {
			for (let page = 1; page <= maxPages; page++) {
				const currentUrl = this.appendPageNumber(site, targetUrl, page, pageInfo);
				const pageLabel = maxPages > 1 ? ` (${page}/${maxPages}페이지)` : '';

				await this.upsertState(site, targetUrl, {
					status: 'running',
					message: `수집 중${pageLabel}...`
				});

				try {
					const posts = await scraperFn(currentUrl);
					if (posts.length) {
						const newCount = await this.upsertPosts(posts);
						totalNew += newCount;
					}
				} catch (e) {
					console.error(`Scrape failed for ${site} page ${page}`, e);
					errors++;
					if (page === 1 && stopOnError) {
						throw e;
					}
					if (errors > maxErrors) {
						throw new Error(`Too many errors (${errors})`);
					}
				}

				// Friendly delay between pages to avoid rate limits
				if (page < maxPages) {
					await new Promise((r) => setTimeout(r, pageDelayMs));
				}
			}

			await this.upsertState(site, targetUrl, {
				status: 'success',
				message: `성공 (신규 ${totalNew}건)${errors > 0 ? `, 오류 ${errors}회` : ''}`
			});

			return { count: totalNew };
		} catch (error) {
			const message = error instanceof Error ? error.message : '알 수 없는 오류';
			await this.upsertState(site, targetUrl, { status: 'error', message });
			throw error;
		}
	}
}
