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
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

	type LoadData = Awaited<ReturnType<typeof load>>;
	type RawPost = LoadData['posts'][number];
	type RawScraperState = LoadData['scraperStates'][number];

	type SiteKey = 'kissav' | 'missav' | 'twidouga' | 'kone' | 'torrentbot';
	type SiteFilter = 'all' | SiteKey;
	type ReadFilter = 'all' | 'read' | 'unread';

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
		kone: 'kone',
		torrentbot: 'torrentbot'
	};

	const siteOrder: SiteKey[] = ['kissav', 'missav', 'twidouga', 'kone', 'torrentbot'];

	const defaultScraperTargets: Record<SiteKey, string> = {
		kissav: 'https://kissjav.com/most-popular/?sort_by=video_viewed_week',
		missav: 'https://missav123.to/ko/all?sort=weekly_views',
		twidouga: 'https://twidouga.com/trending',
		kone: 'https://kone.com/front',
		torrentbot: 'https://torrentbot.com/feed'
	};

	const defaultScraperStates: Record<SiteKey, ScraperState> = {
		kissav: { status: 'idle', message: '대기 중' },
		missav: { status: 'idle', message: '대기 중' },
		twidouga: { status: 'unsupported', message: 'HTTP 수집 미지원' },
		kone: { status: 'unsupported', message: 'HTTP 수집 미지원' },
		torrentbot: { status: 'unsupported', message: 'HTTP 수집 미지원' }
	};

	const { data } = $props<{ data: LoadData }>();

let rows = $state<Post[]>(normalizePosts(data.posts));
let scraperStates = $state<Record<SiteKey, ScraperState>>(
	normalizeScraperStates(normalizeScraperRows(data.scraperStates))
);
	let scraperTargets = $state<Record<SiteKey, string>>({ ...defaultScraperTargets });
	let siteFilter = $state<SiteFilter>('all');
	let readFilter = $state<ReadFilter>('all');
	let showScraperPanel = $state(true);
	let showThumbnails = $state(true);

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

	const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});

	let lastUpdated = $state<Date | null>(null);

	$effect(() => {
		const timestamps = Object.values(scraperStates)
			.map((state) => state.lastRun?.getTime())
			.filter((value): value is number => Boolean(value));
		lastUpdated = timestamps.length ? new Date(Math.max(...timestamps)) : null;
	});

	const filteredRows = $derived.by((): Post[] =>
		rows.filter((row) => {
			if (siteFilter !== 'all' && row.site !== siteFilter) return false;
			if (readFilter === 'read' && !row.read) return false;
			if (readFilter === 'unread' && row.read) return false;
			return true;
		})
	);

	const readStatusSummary = $derived.by(() => {
		const total = rows.length;
		const read = rows.filter((row) => row.read).length;
		return {
			read,
			unread: total - read
		};
	});

	$effect(() => {
		scraperTargets = deriveTargets(scraperStates);
	});

	onMount(() => {
		// 클라이언트에서 최신 데이터로 동기화
		void refetchData();
	});

	function isSiteKey(value: string): value is SiteKey {
		return siteOrder.includes(value as SiteKey);
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

	function formatDateTime(date?: Date | null) {
		if (!date) return '없음';
		return dateTimeFormatter.format(date);
	}

	function formatPostedAt(value?: string | null) {
		return value ?? '미상';
	}

	function navigateToUrl(url?: string | null) {
		if (!url) return;
		if (typeof window === 'undefined') return;
		window.open(url, '_blank', 'noreferrer');
	}

	function getThumbnail(site: SiteKey, value?: string | null) {
		if (value && value.trim()) return value;
		return `https://placehold.co/160x100/0f172a/ffffff?text=${siteLabels[site]}`;
	}

	function toggleThumbnails() {
		showThumbnails = !showThumbnails;
	}

async function resetData() {
	try {
		const res = await fetch('/api/weekly-check', { method: 'DELETE' });
		if (!res.ok) throw new Error(`reset failed: ${res.status}`);

		rows = [];
		scraperStates = { ...defaultScraperStates };
		scraperTargets = { ...defaultScraperTargets };
		siteFilter = 'all';
		readFilter = 'all';
		showScraperPanel = true;
		showThumbnails = true;
		lastUpdated = null;

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
			await refetchData();
		} catch (error) {
			console.error('weekly-check: target update failed', error);
		}
	}

	function toggleScraperVisibility() {
		showScraperPanel = !showScraperPanel;
	}

	async function triggerScrape(site: SiteKey) {
		const current = scraperStates[site];
		if (current.status === 'running' || current.status === 'unsupported') return;

		const endpointMap: Record<SiteKey, string | null> = {
			kissav: '/api/weekly-check/kissav',
			missav: '/api/weekly-check/missav',
			twidouga: null,
			kone: null,
			torrentbot: null
		};

		const endpoint = endpointMap[site];
		if (!endpoint) return;

		scraperStates = {
			...scraperStates,
			[site]: { ...current, status: 'running', message: '요청 중...' }
		};

		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUrl: scraperTargets[site] })
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
</script>

<div class="flex w-full h-full flex-col min-h-0">
	<div class="flex w-full flex-1 flex-col gap-6 p-6 overflow-auto min-h-0">
		<section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-1">
				<p class="text-xs uppercase tracking-[0.2em] text-primary">Weekly Check</p>
				<h1 class="text-3xl font-semibold leading-tight">주간 인기 게시물 모니터링</h1>
				<p class="text-sm text-muted-foreground">
					스크래퍼 연동 전 목업 화면입니다. 사이트별 최신 인기 게시물을 테이블로 확인하고 스크래퍼
					호출 상태를 점검합니다.
				</p>
				<p class="text-xs text-muted-foreground">
					마지막 업데이트: {lastUpdated ? formatDateTime(lastUpdated) : 'N/A'} (목업 기준)
				</p>
			</div>

			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={toggleThumbnails}>
					{showThumbnails ? '썸네일 숨기기' : '썸네일 보이기'}
				</Button>
				<Button variant="ghost" size="sm" onclick={refetchData}>데이터 새로고침</Button>
				<Button variant="ghost" size="sm" onclick={resetData}>데이터 초기화</Button>
			</div>
		</section>

		<section class="rounded-lg border bg-card p-4 shadow-sm">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 class="text-lg font-semibold">스크래퍼 상태</h2>
					<p class="text-sm text-muted-foreground">
						타겟 URL, 최신 수집 일자, 수집 버튼을 간소하게 표시
					</p>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={toggleScraperVisibility}>
						{showScraperPanel ? '스크래퍼 숨기기' : '스크래퍼 표시'}
					</Button>
					<Badge variant="outline">DB 연동</Badge>
				</div>
			</div>
			{#if showScraperPanel}
				<div class="grid gap-3 sm:grid-cols-1 lg:grid-cols-5">
					{#each siteOrder as site}
						{@const state = scraperStates[site]}
						<div
							class="flex flex-col gap-2 rounded-md border bg-background px-3 py-3 text-sm shadow-sm"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="space-y-1">
									<div class="flex items-center gap-2 text-base font-medium capitalize">
										<span>{siteLabels[site]}</span>
										{#if site === 'torrentbot'}
											<Badge variant="destructive">비활성</Badge>
										{/if}
									</div>
									<p class="text-xs text-muted-foreground">
										{state.message ?? '대기 중'}
									</p>
								</div>
								<div class="flex items-center gap-2">
									<Badge variant={statusBadgeVariants[state.status]}>
										{statusLabels[state.status]}
									</Badge>
									<Button
										size="sm"
										variant="ghost"
										disabled={state.status === 'running' || state.status === 'unsupported'}
										onclick={() => triggerScrape(site)}
									>
										{state.status === 'running' ? '요청 중...' : '재수집'}
									</Button>
								</div>
							</div>
							<p class="text-xs text-muted-foreground">
								최신 수집: {formatDateTime(state.lastRun)}
							</p>
							<div class="grid gap-1">
								<label
									class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
									for={`scraper-target-${site}`}
								>
									타겟 URL
								</label>
								<input
									id={`scraper-target-${site}`}
									type="text"
									class="w-full rounded-md border bg-background px-2 py-1 text-sm focus-visible:border-primary focus-visible:outline-none"
									value={scraperTargets[site]}
									oninput={(event) => setScraperTarget(site, event.currentTarget.value)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-xs text-muted-foreground">
					스크래퍼 섹션이 숨겨진 상태입니다. 버튼을 눌러 다시 표시하세요.
				</p>
			{/if}
		</section>

		<section class="rounded-lg border bg-card p-4 shadow-sm">
			<div class="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div class="space-y-1">
					<h2 class="text-lg font-semibold">주간 인기 게시물</h2>
					<p class="text-sm text-muted-foreground">
						각 행은 목업 데이터이며 읽음 처리, 좋아요 토글, 썸네일 토글을 테스트할 수 있습니다.
					</p>
				</div>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
					<label class="flex items-center gap-2 text-sm text-muted-foreground">
						<span class="whitespace-nowrap">사이트 필터</span>
						<select
							class="rounded-md border bg-background px-2 py-1 text-sm"
							bind:value={siteFilter}
						>
							<option value="all">전체</option>
							{#each siteOrder as site}
								<option value={site}>{siteLabels[site]}</option>
							{/each}
						</select>
					</label>
					<label class="flex items-center gap-2 text-sm text-muted-foreground">
						<span class="whitespace-nowrap">읽음 상태</span>
						<select
							class="rounded-md border bg-background px-2 py-1 text-sm"
							bind:value={readFilter}
						>
							<option value="all">전체</option>
							<option value="read">읽음</option>
							<option value="unread">읽지 않음</option>
						</select>
					</label>
					<p class="text-sm text-muted-foreground text-right">총 {filteredRows.length}건</p>
				</div>
				<p class="text-xs text-muted-foreground text-right">
					읽음 {readStatusSummary.read} · 읽지 않음 {readStatusSummary.unread}
				</p>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="w-12">#</TableHead>
						<TableHead class="w-28">사이트</TableHead>
						<TableHead>게시물 제목</TableHead>
						<TableHead class="w-36 text-center">썸네일</TableHead>
						<TableHead class="w-28">게시일</TableHead>
						<TableHead class="w-28 text-center">좋아요</TableHead>
						<TableHead class="w-24 text-center">읽음</TableHead>
						<TableHead class="w-24 text-center">상태</TableHead>
						<TableHead class="w-32">수집 일자</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filteredRows as row, index}
						{@const state = scraperStates[row.site]}
						<tr
							data-state={row.read ? 'selected' : undefined}
							class={`hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors ${row.url ? 'cursor-pointer' : ''}`}
							onclick={() => navigateToUrl(row.url)}
						>
							<TableCell class="text-muted-foreground">{index + 1}</TableCell>
							<TableCell>
								<div class="flex flex-col gap-1">
									<Badge variant="outline" class="w-fit capitalize">{siteLabels[row.site]}</Badge>
									{#if row.site === 'torrentbot'}
										<span class="text-[11px] text-destructive">수집 비활성</span>
									{/if}
								</div>
							</TableCell>
							<TableCell>
								<div class="relative group max-w-[720px]">
									<p class="font-medium leading-snug truncate" title={row.title}>
										{row.title}
									</p>
									<div
										class="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-xs whitespace-normal rounded-md border bg-card px-3 py-2 text-xs text-foreground shadow-md group-hover:block"
									>
										{row.title}
									</div>
								</div>
							</TableCell>
							<TableCell class="text-center">
								{#if showThumbnails}
									<div class="relative inline-flex items-center justify-center group">
										<img
											src={getThumbnail(row.site, row.thumbnail)}
											alt={`${siteLabels[row.site]} thumbnail`}
											class="mx-auto h-16 w-24 rounded-md border object-cover transition duration-200 group-hover:scale-110"
											loading="lazy"
										/>
										<div
											class="pointer-events-none absolute left-1/2 bottom-full mb-2 hidden w-44 -translate-x-1/2 flex-col items-center gap-1 rounded-xl border bg-card/90 p-2 text-[11px] text-muted-foreground shadow-lg backdrop-blur group-hover:flex"
										>
											<img
												src={getThumbnail(row.site, row.thumbnail)}
												alt="preview"
												class="h-32 w-48 rounded-md border object-cover"
											/>
											<span>썸네일 미리보기</span>
										</div>
									</div>
								{:else}
									<span class="text-xs text-muted-foreground">숨김</span>
								{/if}
							</TableCell>
							<TableCell>{formatPostedAt(row.postedAt)}</TableCell>
							<TableCell class="text-center">
								<Button
									size="sm"
									variant={row.liked ? 'secondary' : 'ghost'}
									onclick={(event) => {
										event.stopPropagation();
										void toggleLike(row.id);
									}}
									aria-pressed={row.liked}
									class={row.liked ? 'text-destructive' : 'text-muted-foreground'}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="h-4 w-4"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M12 21s-1-.45-2.1-1.2C7.4 18.8 4 16.1 4 11.7 4 8.3 6.3 6 9.2 6 10.7 6 12 6.9 12.8 7.9 13.6 6.9 14.9 6 16.4 6 19.3 6 21.6 8.3 21.6 11.7c0 4.4-3.4 7.1-5.9 8.1C13 20.55 12 21 12 21z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="sr-only">좋아요</span>
								</Button>
							</TableCell>
							<TableCell class="text-center">
								<Button
									size="sm"
									variant={row.read ? 'secondary' : 'outline'}
									onclick={(event) => {
										event.stopPropagation();
										void toggleRead(row.id);
									}}
								>
									{row.read ? '읽음' : '읽지 않음'}
								</Button>
							</TableCell>
							<TableCell class="text-center">
								<Badge variant={statusBadgeVariants[state.status]}>
									{statusLabels[state.status]}
								</Badge>
							</TableCell>
							<TableCell class="text-xs text-muted-foreground">
								{formatDateTime(state.lastRun)}
							</TableCell>
						</tr>
					{/each}
				</TableBody>
			</Table>
		</section>
	</div>
</div>
