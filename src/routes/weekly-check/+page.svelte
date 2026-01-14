<script lang="ts" module>
	type LoadData = {
		posts: {
			id: number;
			site: string;
			sourceId: string;
			title: string;
			url: string | null;
			thumbnail: string | null;
			postedAt: string | null;
			liked: number | boolean;
			read: number | boolean;
		}[];
		scraperStates: {
			id: number;
			site: string;
			targetUrl: string;
			status: string;
			message: string | null;
			lastRun: number | null;
		}[];
	};

	export const load = async ({ fetch }: { fetch: typeof globalThis.fetch }): Promise<LoadData> => {
		try {
			const res = await fetch('/api/weekly-check');
			if (res.ok) {
				const data = (await res.json()) as LoadData;
				return {
					posts: data.posts ?? [],
					scraperStates: data.scraperStates ?? []
				};
			}
		} catch (error) {
			console.error('weekly-check: load failed', error);
		}

		return { posts: [], scraperStates: [] };
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';
	import WeeklyCheckSite from '$lib/components/weekly-check/weekly-check-site.svelte';
	import { cn } from '$lib/utils';

	type LoadData = Awaited<ReturnType<typeof load>>;
	type RawPost = LoadData['posts'][number];
	type RawScraperState = LoadData['scraperStates'][number];

	type SiteKey = 'kissav' | 'missav' | 'twidouga' | 'torrentbot' | 'kone';
	type PagedSite = 'kissav' | 'missav';

	type ScraperState = {
		status: 'idle' | 'running' | 'success' | 'error' | 'unsupported';
		lastRun?: Date;
		message?: string;
		targetUrl?: string;
	};

	type Post = {
		id: number;
		site: SiteKey;
		sourceId: string;
		title: string;
		url: string | null;
		thumbnail: string | null;
		postedAt: string | null;
		liked: boolean;
		read: boolean;
	};

	type ScraperStateRow = {
		id: number;
		site: SiteKey;
		targetUrl: string;
		status: string;
		message: string | null;
		lastRun: number | null;
	};

	const siteLabels: Record<SiteKey, string> = {
		kissav: 'kissav',
		missav: 'missav',
		twidouga: 'twidouga',
		torrentbot: 'torrentbot',
		kone: 'kone'
	};

	const siteOrder: SiteKey[] = ['kissav', 'missav', 'twidouga', 'torrentbot', 'kone'];
	const manualOnlySites: SiteKey[] = ['kone', 'twidouga', 'torrentbot'];
	// missav supports both manual and auto
	const manualUploadSites: SiteKey[] = [...manualOnlySites, 'missav'];
	const autoSites: PagedSite[] = siteOrder.filter(
		(s) => !manualOnlySites.includes(s)
	) as PagedSite[];

	const defaultScraperTargets: Record<SiteKey, string> = {
		kissav: 'https://kissjav.com/most-popular/?sort_by=video_viewed_week',
		missav: 'https://missav123.to/ko/all?sort=weekly_views',
		twidouga: 'https://www.twidouga.net/ko/ranking_t1.php',
		torrentbot: 'https://torrentbot224.site/topic/index?top=20',
		kone: 'https://kone.gg/s/pornvideo?mode=hot'
	};

	const defaultScraperStates: Record<SiteKey, ScraperState> = {
		kissav: { status: 'idle', message: '대기 중' },
		missav: { status: 'idle', message: '대기 중' },
		twidouga: { status: 'unsupported', message: 'HTTP 수집 미지원' },
		torrentbot: { status: 'idle', message: '대기 중' },
		kone: { status: 'idle', message: '대기 중' }
	};

	const { data } = $props<{ data: LoadData }>();

	let rows = $state<Post[]>(normalizePosts(data.posts));
	let scraperStates = $state<Record<SiteKey, ScraperState>>(
		normalizeScraperStates(normalizeScraperRows(data.scraperStates))
	);
	let scraperTargets = $state<Record<SiteKey, string>>({ ...defaultScraperTargets });
	const defaultMaxPages: Record<PagedSite, number> = { kissav: 1, missav: 1 };
	let scraperMaxPages = $state<Record<PagedSite, number>>({ ...defaultMaxPages });

	// State for UI
	let activeTab = $state<SiteKey>('missav');
	let showThumbnails = $state(true);

	// Dialog states
	let manualDialogOpen = $state(false);
	let manualSite = $state<SiteKey>('kone');
	let manualHtml = $state('');
	let manualLoading = $state(false);
	let manualMessage = $state<string | null>(null);

	const statusLabels: Record<ScraperState['status'], string> = {
		idle: '대기',
		running: '요청 중',
		success: '성공',
		error: '실패',
		unsupported: '비활성'
	};

	const statusBadgeVariants: Record<ScraperState['status'], BadgeVariant> = {
		idle: 'secondary',
		running: 'outline',
		success: 'default',
		error: 'destructive',
		unsupported: 'outline'
	};

	$effect(() => {
		scraperTargets = deriveTargets(scraperStates);
	});

	onMount(() => {
		void refetchData();
	});

	function isSiteKey(value: string): value is SiteKey {
		return siteOrder.includes(value as SiteKey);
	}

	function isPagedSite(value: SiteKey): value is PagedSite {
		return autoSites.includes(value as PagedSite);
	}

	function toDate(value?: number | null) {
		if (!value) return undefined;
		return new Date(value * 1000);
	}

	function normalizeScraperStates(list: ScraperStateRow[] = []): Record<SiteKey, ScraperState> {
		const result: Record<SiteKey, ScraperState> = { ...defaultScraperStates };

		for (const row of list) {
			if (!isSiteKey(row.site)) continue;
			result[row.site] = {
				status: coerceStatus(row.status),
				message: row.message ?? defaultScraperStates[row.site].message,
				lastRun: toDate(row.lastRun),
				targetUrl: row.targetUrl ?? defaultScraperTargets[row.site]
			};
		}
		return result;
	}

	function coerceStatus(value: string): ScraperState['status'] {
		if (
			value === 'running' ||
			value === 'success' ||
			value === 'error' ||
			value === 'unsupported'
		) {
			return value;
		}
		return 'idle';
	}

	function normalizePosts(list: LoadData['posts'] = []): Post[] {
		return list
			.filter((post): post is RawPost => isSiteKey(post.site))
			.map((post) => ({
				id: post.id,
				site: post.site as SiteKey,
				sourceId: post.sourceId,
				title: post.title,
				url: post.url ?? null,
				thumbnail: post.thumbnail ?? null,
				postedAt: post.postedAt ?? null,
				liked: Boolean(post.liked),
				read: Boolean(post.read)
			}));
	}

	function normalizeScraperRows(list: LoadData['scraperStates'] = []): ScraperStateRow[] {
		return list
			.filter((row): row is RawScraperState => isSiteKey(row.site))
			.map((row) => ({
				id: row.id,
				site: row.site as SiteKey,
				targetUrl: row.targetUrl,
				status: row.status,
				message: row.message,
				lastRun: row.lastRun
			}));
	}

	function deriveTargets(states: Record<SiteKey, ScraperState>): Record<SiteKey, string> {
		const result = { ...defaultScraperTargets };
		for (const site of siteOrder) {
			const value = states[site]?.targetUrl;
			if (value) result[site] = value;
		}
		return result;
	}

	// --- Scraper & Data Logic ---

	async function resetData() {
		try {
			const res = await fetch('/api/weekly-check', { method: 'DELETE' });
			if (!res.ok) throw new Error(`reset failed: ${res.status}`);
			rows = [];
			scraperStates = { ...defaultScraperStates };
			scraperTargets = { ...defaultScraperTargets };
			await refetchData();
		} catch (error) {
			console.error('weekly-check: reset failed', error);
		}
	}

	async function refetchData() {
		try {
			const res = await fetch('/api/weekly-check');
			if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
			const payload = (await res.json()) as LoadData;
			rows = normalizePosts(payload.posts);
			scraperStates = normalizeScraperStates(normalizeScraperRows(payload.scraperStates));
			scraperTargets = deriveTargets(scraperStates);
		} catch (error) {
			console.error('weekly-check: refetch failed', error);
		}
	}

	async function updatePost(id: number, updates: Partial<Pick<Post, 'liked' | 'read'>>) {
		try {
			const res = await fetch('/api/weekly-check', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, ...updates })
			});
			if (!res.ok) throw new Error(`update failed: ${res.status}`);
			const payload = (await res.json()) as { post?: Post };
			const updated: Post | undefined = payload.post;
			if (!updated) return;
			rows = rows.map((row) => (row.id === updated.id ? { ...row, ...updated } : row));
		} catch (error) {
			console.error('weekly-check: post update failed', error);
		}
	}

	async function toggleRead(id: number) {
		const target = rows.find((row) => row.id === id);
		if (!target) return;
		const next = !target.read;
		rows = rows.map((row) => (row.id === id ? { ...row, read: next } : row));
		await updatePost(id, { read: next });
	}

	async function toggleLike(id: number) {
		const target = rows.find((row) => row.id === id);
		if (!target) return;
		const next = !target.liked;
		rows = rows.map((row) => (row.id === id ? { ...row, liked: next } : row));
		await updatePost(id, { liked: next });
	}

	async function setScraperTarget(site: SiteKey, value: string) {
		scraperTargets = { ...scraperTargets, [site]: value };
		try {
			const res = await fetch('/api/weekly-check', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ site, targetUrl: value })
			});
			if (!res.ok) throw new Error(`target update failed: ${res.status}`);
		} catch (error) {
			console.error('weekly-check: target update failed', error);
		}
	}

	function setMaxPages(site: PagedSite, value: number) {
		const normalized = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
		scraperMaxPages = { ...scraperMaxPages, [site]: normalized };
	}

	function openManualDialog(site: SiteKey) {
		manualSite = site;
		manualHtml = '';
		manualMessage = null;
		manualDialogOpen = true;
	}

	function closeManualDialog() {
		if (manualLoading) return;
		manualDialogOpen = false;
	}

	async function submitManualHtml() {
		if (!manualHtml.trim()) return;
		manualLoading = true;
		manualMessage = null;
		try {
			const res = await fetch(`/api/weekly-check/${manualSite}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					html: manualHtml,
					targetUrl: scraperTargets[manualSite]
				})
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `HTTP ${res.status}`);
			}
			await refetchData();
			manualHtml = '';
			manualDialogOpen = false;
		} catch (error) {
			manualMessage = error instanceof Error ? error.message : '업로드 실패';
		} finally {
			manualLoading = false;
		}
	}

	async function triggerScrape(site: SiteKey) {
		const current = scraperStates[site];
		if (current.status === 'running' || current.status === 'unsupported') return;

		const endpointMap: Record<SiteKey, string | null> = {
			kissav: '/api/weekly-check/kissav',
			missav: '/api/weekly-check/missav',
			twidouga: null,
			torrentbot: null,
			kone: null
		};

		const endpoint = endpointMap[site];
		if (!endpoint) return;

		scraperStates = {
			...scraperStates,
			[site]: { ...current, status: 'running', message: '요청 중...' }
		};

		try {
			const payload: { targetUrl: string; maxPages?: number } = {
				targetUrl: scraperTargets[site]
			};
			if (isPagedSite(site)) {
				payload.maxPages = scraperMaxPages[site] ?? 1;
			}

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`scrape failed: ${res.status}`);
			await refetchData();
		} catch (error) {
			console.error('weekly-check: scrape failed', error);
			scraperStates = {
				...scraperStates,
				[site]: { ...current, status: 'error', message: '실패 (오류 발생)' }
			};
		}
	}

	function getSiteUrl(site: SiteKey, url?: string | null) {
		if (!url) return null;
		// 절대 URL이면 그대로 사용
		if (url.startsWith('http://') || url.startsWith('https://')) return url;
		// 상대 경로일 때는 현재 타겟 URL의 호스트를 붙인다.
		const target = scraperTargets[site];
		try {
			const base = new URL(target);
			const path = url.startsWith('/') ? url : `/${url}`;
			return `${base.origin}${path}`;
		} catch {
			return url;
		}
	}

	function handleOpenLink(site: SiteKey, url: string | null) {
		const finalUrl = getSiteUrl(site, url);
		if (!finalUrl) return;
		window.open(finalUrl, '_blank', 'noreferrer');
	}

	function toggleThumbnails() {
		showThumbnails = !showThumbnails;
	}
</script>

<div class="flex w-full h-full flex-col min-h-0">
	<div class="flex w-full flex-1 flex-col gap-6 p-6 overflow-auto min-h-0">
		<!-- Header -->
		<section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-1">
				<h1 class="text-3xl font-semibold leading-tight">주간 인기 게시물 모니터링</h1>
				<p class="text-xs text-muted-foreground">타겟 사이트별 수집 및 확인</p>
			</div>

			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={toggleThumbnails}>
					{showThumbnails ? '썸네일 숨기기' : '썸네일 보이기'}
				</Button>
				<Button variant="ghost" size="sm" onclick={refetchData}>데이터 새로고침</Button>
				<Button variant="ghost" size="sm" onclick={resetData}>전체 초기화</Button>
			</div>
		</section>

		<!-- Tab Navigation -->
		<div class="border-b">
			<nav class="-mb-px flex gap-4" aria-label="Tabs">
				{#each siteOrder as site}
					<button
						onclick={() => (activeTab = site)}
						class={cn(
							'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
							activeTab === site
								? 'border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
						)}
					>
						{siteLabels[site]}
						<span class="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs">
							{rows.filter((r) => r.site === site && !r.read).length}
						</span>
					</button>
				{/each}
			</nav>
		</div>

		<!-- Content Area -->
		<div class="flex-1 min-h-0">
			{#key activeTab}
				<WeeklyCheckSite
					site={activeTab}
					siteLabel={siteLabels[activeTab]}
					posts={rows.filter((r) => r.site === activeTab)}
					scraperState={scraperStates[activeTab]}
					scraperTarget={scraperTargets[activeTab]}
					scraperMaxPages={isPagedSite(activeTab) ? scraperMaxPages[activeTab] : undefined}
					isPaged={isPagedSite(activeTab)}
					isAutoSupported={autoSites.includes(activeTab as PagedSite)}
					isManualSupported={manualUploadSites.includes(activeTab)}
					{statusLabels}
					{statusBadgeVariants}
					{showThumbnails}
					onTriggerScrape={() => triggerScrape(activeTab)}
					onUpdateTarget={(v) => setScraperTarget(activeTab, v)}
					onUpdateMaxPages={(v) => isPagedSite(activeTab) && setMaxPages(activeTab, v)}
					onManualUpload={() => openManualDialog(activeTab)}
					onToggleLike={toggleLike}
					onToggleRead={toggleRead}
					onOpenLink={(url) => handleOpenLink(activeTab, url)}
				/>
			{/key}
		</div>
	</div>
</div>

<!-- Manual Upload Dialog -->
{#if manualDialogOpen}
	<div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" aria-hidden="true"></div>
	<div
		class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
	>
		<div class="flex flex-col space-y-1.5 text-center sm:text-left">
			<h2 class="text-lg font-semibold leading-none tracking-tight">
				수동 수집 ({siteLabels[manualSite]})
			</h2>
			<p class="text-sm text-muted-foreground">사이트 소스(HTML)를 복사하여 붙여넣으세요.</p>
		</div>
		<div class="grid gap-4 py-4">
			<textarea
				class="flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				placeholder="<html>...</html>"
				bind:value={manualHtml}
			></textarea>
			{#if manualMessage}
				<p class="text-sm text-destructive">{manualMessage}</p>
			{/if}
		</div>
		<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
			<Button variant="outline" onclick={closeManualDialog}>취소</Button>
			<Button onclick={submitManualHtml} disabled={manualLoading}>
				{manualLoading ? '업로드 중...' : '업로드'}
			</Button>
		</div>
	</div>
{/if}
