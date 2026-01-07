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

	type SiteKey = 'kissav' | 'missav' | 'twidouga' | 'kone' | 'torrentbot';

	type ScraperState = {
		status: 'idle' | 'running' | 'success' | 'error' | 'unsupported';
		lastRun?: Date;
		message?: string;
	};

	type Post = {
		id: string;
		site: SiteKey;
		title: string;
		thumbnail: string;
		postedAt?: string;
		likes: number;
		liked: boolean;
		read: boolean;
	};

	type SiteFilter = 'all' | SiteKey;

	const siteLabels: Record<SiteKey, string> = {
		kissav: 'kissav',
		missav: 'missav',
		twidouga: 'twidouga',
		kone: 'kone',
		torrentbot: 'torrentbot'
	};

	const siteOrder: SiteKey[] = ['kissav', 'missav', 'twidouga', 'kone', 'torrentbot'];

	const initialScraperStates = {
		kissav: {
			status: 'idle',
			message: '대기 중',
			lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4)
		},
		missav: {
			status: 'success',
			message: '최근 성공',
			lastRun: new Date(Date.now() - 1000 * 60 * 60 * 9)
		},
		twidouga: {
			status: 'idle',
			message: '대기 중'
		},
		kone: {
			status: 'error',
			message: '최근 실패 (목업)',
			lastRun: new Date(Date.now() - 1000 * 60 * 60 * 12)
		},
		torrentbot: {
			status: 'unsupported',
			message: 'HTTP 수집 미지원'
		}
	} satisfies Record<SiteKey, ScraperState>;

	const initialScraperTargets: Record<SiteKey, string> = {
		kissav: 'https://kissav.com/latest',
		missav: 'https://missav.com/popular/week',
		twidouga: 'https://twidouga.com/trending',
		kone: 'https://kone.com/front',
		torrentbot: 'https://torrentbot.com/feed'
	};

	const scraperTargetStorageKey = 'weekly-check-scraper-targets';

	const initialPosts: Post[] = [
		{
			id: 'kissav-1',
			site: 'kissav',
			title: '[KissAV] 1월 첫째주 인기: studio release highlight 모음',
			thumbnail: 'https://placehold.co/160x100/0f172a/ffffff?text=kissav',
			postedAt: '2026-01-05',
			likes: 41,
			liked: false,
			read: false
		},
		{
			id: 'kissav-2',
			site: 'kissav',
			title: '[KissAV] 고화질 직캠 베스트 5선',
			thumbnail: 'https://placehold.co/160x100/1e293b/ffffff?text=kissav',
			postedAt: '2026-01-04',
			likes: 28,
			liked: true,
			read: true
		},
		{
			id: 'missav-1',
			site: 'missav',
			title: '[MissAV] 프리미엄 랭킹 업데이트 (주간 탑 10)',
			thumbnail: 'https://placehold.co/160x100/0ea5e9/ffffff?text=missav',
			postedAt: '2026-01-06',
			likes: 33,
			liked: false,
			read: false
		},
		{
			id: 'missav-2',
			site: 'missav',
			title: '[MissAV] 인기 배우 합본 세트 할인 소식',
			thumbnail: 'https://placehold.co/160x100/22c55e/0b1726?text=missav',
			postedAt: '2026-01-03',
			likes: 19,
			liked: false,
			read: false
		},
		{
			id: 'twidouga-1',
			site: 'twidouga',
			title: '[Twidouga] 짧은 클립 모음 - SNS 바이럴',
			thumbnail: 'https://placehold.co/160x100/f97316/0b1726?text=twidouga',
			postedAt: '2026-01-02',
			likes: 22,
			liked: false,
			read: false
		},
		{
			id: 'twidouga-2',
			site: 'twidouga',
			title: '[Twidouga] 인기 태그 실시간 TOP 5',
			thumbnail: 'https://placehold.co/160x100/f59e0b/0b1726?text=twidouga',
			postedAt: '2026-01-01',
			likes: 17,
			liked: false,
			read: true
		},
		{
			id: 'kone-1',
			site: 'kone',
			title: '[Kone] 신규 시리즈 런칭 안내',
			thumbnail: 'https://placehold.co/160x100/6366f1/ffffff?text=kone',
			postedAt: '2026-01-04',
			likes: 24,
			liked: false,
			read: false
		},
		{
			id: 'kone-2',
			site: 'kone',
			title: '[Kone] 커뮤니티 추천 TOP',
			thumbnail: 'https://placehold.co/160x100/312e81/ffffff?text=kone',
			likes: 11,
			liked: false,
			read: false
		},
		{
			id: 'torrentbot-1',
			site: 'torrentbot',
			title: '[TorrentBot] 자동 수집 비활성 상태 - 수동 확인 필요',
			thumbnail: 'https://placehold.co/160x100/475569/ffffff?text=torrentbot',
			likes: 5,
			liked: false,
			read: false
		}
	];

	let rows = $state<Post[]>(structuredClone(initialPosts));
	let showThumbnails = $state(true);
	let scraperStates = $state<Record<SiteKey, ScraperState>>(structuredClone(initialScraperStates));
	let scraperTargets = $state<Record<SiteKey, string>>(structuredClone(initialScraperTargets));
	let siteFilter = $state<SiteFilter>('all');
	let showScraperPanel = $state(true);

	function persistScraperTargets(targets: Record<SiteKey, string>) {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(scraperTargetStorageKey, JSON.stringify(targets));
	}

	onMount(() => {
		if (typeof window === 'undefined') return;
		const stored = window.localStorage.getItem(scraperTargetStorageKey);
		if (!stored) return;

		try {
			const parsed = JSON.parse(stored);
			if (!parsed || typeof parsed !== 'object') return;

			const updates: Partial<Record<SiteKey, string>> = {};
			for (const site of siteOrder) {
				const value = parsed[site];
				if (typeof value === 'string') {
					updates[site] = value;
				}
			}

			if (Object.keys(updates).length) {
				scraperTargets = { ...scraperTargets, ...updates };
			}
		} catch (error) {
			console.error('weekly-check: scraper targets load failed', error);
		}
	});

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
		rows.filter((row) => siteFilter === 'all' || row.site === siteFilter)
	);

	function formatDateTime(date?: Date | null) {
		if (!date) return '없음';
		return dateTimeFormatter.format(date);
	}

	function formatPostedAt(value?: string) {
		return value ?? '미상';
	}

	function toggleThumbnails() {
		showThumbnails = !showThumbnails;
	}

	function resetMocks() {
		rows = structuredClone(initialPosts);
		scraperStates = structuredClone(initialScraperStates);
		showThumbnails = true;
		siteFilter = 'all';
		scraperTargets = structuredClone(initialScraperTargets);
		showScraperPanel = true;
		persistScraperTargets(scraperTargets);
	}

	function toggleRead(id: string) {
		rows = rows.map((row) => (row.id === id ? { ...row, read: !row.read } : row));
	}

	function toggleLike(id: string) {
		rows = rows.map((row) => (row.id === id ? { ...row, liked: !row.liked } : row));
	}

	function setScraperTarget(site: SiteKey, value: string) {
		const next = { ...scraperTargets, [site]: value };
		scraperTargets = next;
		persistScraperTargets(next);
	}

	function toggleScraperVisibility() {
		showScraperPanel = !showScraperPanel;
	}

	function triggerScrape(site: SiteKey) {
		const current = scraperStates[site];
		if (current.status === 'running' || current.status === 'unsupported') return;

		scraperStates = {
			...scraperStates,
			[site]: { ...current, status: 'running', message: '요청 중...' }
		};

		const duration = 900 + Math.floor(Math.random() * 800);
		setTimeout(() => {
			const success = Math.random() > 0.2;
			const nextState: ScraperState = {
				status: success ? 'success' : 'error',
				lastRun: new Date(),
				message: success ? '정상 완료 (목업)' : '실패 (모의 오류)'
			};

			scraperStates = {
				...scraperStates,
				[site]: nextState
			};
		}, duration);
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
				<Button variant="outline" size="sm" on:click={toggleThumbnails}>
					{showThumbnails ? '썸네일 숨기기' : '썸네일 보이기'}
				</Button>
				<Button variant="ghost" size="sm" on:click={resetMocks}>목업 초기화</Button>
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
					<Button variant="outline" size="sm" on:click={toggleScraperVisibility}>
						{showScraperPanel ? '스크래퍼 숨기기' : '스크래퍼 표시'}
					</Button>
					<Badge variant="outline">목업 · HTTP 없음</Badge>
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
										on:click={() => triggerScrape(site)}
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
					<p class="text-sm text-muted-foreground text-right">총 {filteredRows.length}건</p>
				</div>
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
						<TableRow data-state={row.read ? 'selected' : undefined}>
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
								<div class="space-y-1">
									<p class="font-medium leading-snug">{row.title}</p>
								</div>
							</TableCell>
							<TableCell class="text-center">
								{#if showThumbnails}
									<div class="relative inline-flex items-center justify-center group">
										<img
											src={row.thumbnail}
											alt={`${siteLabels[row.site]} thumbnail`}
											class="mx-auto h-16 w-24 rounded-md border object-cover transition duration-200 group-hover:scale-110"
											loading="lazy"
										/>
										<div
											class="pointer-events-none absolute left-1/2 bottom-full mb-2 hidden w-44 -translate-x-1/2 flex-col items-center gap-1 rounded-xl border bg-card/90 p-2 text-[11px] text-muted-foreground shadow-lg backdrop-blur group-hover:flex"
										>
											<img
												src={row.thumbnail}
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
									on:click={() => toggleLike(row.id)}
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
									on:click={() => toggleRead(row.id)}
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
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</section>
	</div>
</div>
