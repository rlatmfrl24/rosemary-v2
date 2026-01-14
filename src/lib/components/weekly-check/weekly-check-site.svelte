<script lang="ts">
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

	type SiteKey = 'kissav' | 'missav' | 'twidouga' | 'torrentbot' | 'kone';

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

	type ScraperState = {
		status: 'idle' | 'running' | 'success' | 'error' | 'unsupported';
		lastRun?: Date;
		message?: string;
		targetUrl?: string;
	};

	let {
		site,
		posts,
		scraperState,
		siteLabel,
		scraperTarget,
		scraperMaxPages,
		isPaged,
		isManualSupported,
		isAutoSupported,
		onTriggerScrape,
		onUpdateTarget,
		onUpdateMaxPages,
		onManualUpload,
		onToggleLike,
		onToggleRead,
		onOpenLink,
		statusLabels,
		statusBadgeVariants,
		showThumbnails
	} = $props<{
		site: SiteKey;
		posts: Post[];
		scraperState: ScraperState;
		siteLabel: string;
		scraperTarget: string;
		scraperMaxPages?: number;
		isPaged: boolean;
		isManualSupported: boolean;
		isAutoSupported: boolean; // If true, shows auto scraper UI
		onTriggerScrape: () => void;
		onUpdateTarget: (val: string) => void;
		onUpdateMaxPages: (val: number) => void;
		onManualUpload: () => void;
		onToggleLike: (id: number) => void;
		onToggleRead: (id: number) => void;
		onOpenLink: (url: string | null) => void;
		statusLabels: Record<string, string>;
		statusBadgeVariants: Record<string, BadgeVariant>;
		showThumbnails: boolean;
	}>();

	// Computed for display
	const elapsedLabel = $derived(formatElapsedTime(scraperState.lastRun));
	const showStaleReminder = $derived(isStale(scraperState.lastRun));

	// Helper duplications (could be utils, but keeping self-contained for speed unless requested)
	function getHoursSince(date?: Date | null): number | null {
		if (!date) return null;
		const diffMs = Date.now() - date.getTime();
		return Math.floor(diffMs / (1000 * 60 * 60));
	}

	function formatElapsedTime(date?: Date | null) {
		const hours = getHoursSince(date);
		if (hours === null) return '수집 기록 없음';
		if (hours < 1) return '방금 수집됨';
		if (hours < 24) return `${hours}시간 전`;
		const days = Math.floor(hours / 24);
		return `${days}일 전`;
	}

	function isStale(date?: Date | null) {
		const STALE_THRESHOLD_HOURS = 12;
		const hours = getHoursSince(date);
		return hours !== null && hours >= STALE_THRESHOLD_HOURS;
	}

	function formatDateTime(date?: Date | null) {
		if (!date) return '-';
		return new Intl.DateTimeFormat('ko-KR', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function getThumbnail(val?: string | null) {
		if (val && val.trim()) return val;
		return `https://placehold.co/160x100/0f172a/ffffff?text=${siteLabel}`;
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Scraper Control Section -->
	<div class="rounded-lg border bg-card p-4 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-semibold text-lg flex items-center gap-2">
					{siteLabel} 수집기
					<Badge variant={statusBadgeVariants[scraperState.status]}>
						{statusLabels[scraperState.status]}
					</Badge>
				</h3>
				<p class="text-sm text-muted-foreground">{scraperState.message ?? '상태 대기 중'}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-muted-foreground">
					마지막 실행: {formatDateTime(scraperState.lastRun)}
				</p>
				<p
					class="text-xs {showStaleReminder
						? 'text-warning-foreground font-bold'
						: 'text-muted-foreground'}"
				>
					({elapsedLabel})
				</p>
			</div>
		</div>

		{#if showStaleReminder}
			<div
				class="rounded-md border border-warning/50 bg-warning/10 p-2 text-xs text-warning-foreground flex items-center gap-2"
			>
				<span>⚠️ 데이터가 오래되었습니다 (12시간+).</span>
				{#if isAutoSupported}
					<Button
						variant="outline"
						size="icon"
						class="h-6 w-auto px-2 text-[10px]"
						onclick={onTriggerScrape}
					>
						지금 자동 수집
					</Button>
				{/if}
			</div>
		{/if}

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
			<!-- Target Config -->
			<div class="space-y-2 flex-1 min-w-0">
				<label
					for={`target-url-${site}`}
					class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
					>Target URL</label
				>
				<div class="flex gap-2 items-center">
					<input
						id={`target-url-${site}`}
						type="text"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm h-10"
						value={scraperTarget}
						oninput={(e) => onUpdateTarget(e.currentTarget.value)}
					/>
					<Button
						variant="outline"
						class="shrink-0 h-10 gap-2 px-4"
						title="타겟 페이지 새창으로 열기"
						onclick={() => window.open(scraperTarget, '_blank', 'noreferrer')}
					>
						<span>이동</span>
					</Button>
				</div>
			</div>

			<div class="flex items-end gap-2">
				{#if isPaged}
					<div class="space-y-2 w-24">
						<label
							for={`pages-${site}`}
							class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>Pages</label
						>
						<input
							id={`pages-${site}`}
							type="number"
							min="1"
							class="w-full rounded-md border bg-background px-3 py-2 text-sm h-10"
							value={scraperMaxPages}
							oninput={(e) => onUpdateMaxPages(e.currentTarget.valueAsNumber)}
						/>
					</div>
				{/if}

				<div class="flex gap-2">
					{#if isAutoSupported}
						<Button
							variant="default"
							class="h-10"
							disabled={scraperState.status === 'running'}
							onclick={onTriggerScrape}
						>
							{scraperState.status === 'running' ? '수집 중...' : '자동 수집 시작'}
						</Button>
					{/if}

					{#if isManualSupported}
						<Button
							variant={isAutoSupported ? 'outline' : 'default'}
							class="h-10"
							onclick={onManualUpload}
						>
							HTML 업로드
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Data Table Section -->
	<div class="rounded-lg border bg-card shadow-sm">
		<div class="p-4 border-b flex justify-between items-center">
			<h3 class="font-semibold">
				{siteLabel} 게시물 목록
				<span class="text-muted-foreground text-sm font-normal">({posts.length}개)</span>
			</h3>
			<div class="flex gap-2 text-xs">
				<span class="text-primary font-medium">읽음 {posts.filter((p: Post) => p.read).length}</span
				>
				<span class="text-muted-foreground">/</span>
				<span class="text-muted-foreground">안읽음 {posts.filter((p: Post) => !p.read).length}</span
				>
			</div>
		</div>
		<div class="relative w-full overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="w-[60px]">ID</TableHead>
						{#if showThumbnails}
							<TableHead class="w-[100px]">썸네일</TableHead>
						{/if}
						<TableHead>제목 / 원본 정보</TableHead>
						<TableHead class="w-[120px] text-center">업로드일</TableHead>
						<TableHead class="w-[100px] text-center">상태</TableHead>
						<TableHead class="w-[80px] text-right">링크</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if posts.length === 0}
						<TableRow>
							<TableCell
								colspan={showThumbnails ? 6 : 5}
								class="h-24 text-center text-muted-foreground"
							>
								수집된 데이터가 없습니다.
							</TableCell>
						</TableRow>
					{:else}
						{#each posts as post (post.id)}
							<TableRow
								class="transition-colors hover:bg-muted/50 {post.read
									? 'bg-muted/40 opacity-60'
									: ''}"
							>
								<TableCell class="font-mono text-xs text-muted-foreground">
									{post.id}
								</TableCell>
								{#if showThumbnails}
									<TableCell>
										<div class="relative aspect-video w-24 overflow-hidden rounded bg-muted">
											<img
												src={getThumbnail(post.thumbnail)}
												alt=""
												class="h-full w-full object-cover transition-transform hover:scale-105"
												loading="lazy"
											/>
										</div>
									</TableCell>
								{/if}
								<TableCell>
									<div class="flex flex-col gap-1">
										<button
											class="text-left font-medium leading-snug hover:underline hover:text-primary transition-colors"
											onclick={() => onToggleRead(post.id)}
										>
											{post.title}
										</button>
										<div class="flex items-center gap-2 text-xs text-muted-foreground">
											<Badge variant="outline" class="text-[10px] px-1 py-0 h-5">
												{post.sourceId}
											</Badge>
											{#if post.url}
												<span class="truncate max-w-[200px] opacity-70">{post.url}</span>
											{/if}
										</div>
									</div>
								</TableCell>
								<TableCell class="text-center text-xs text-muted-foreground whitespace-nowrap">
									{post.postedAt || '-'}
								</TableCell>
								<TableCell class="text-center">
									<div class="flex items-center justify-center gap-1">
										<Button
											variant={post.read ? 'secondary' : 'ghost'}
											size="icon"
											class="h-8 w-8 {post.read ? 'text-muted-foreground' : 'text-foreground'}"
											onclick={() => onToggleRead(post.id)}
											title="읽음 상태 토글"
										>
											<span class="material-icons-round text-lg">
												{post.read ? 'visibility_off' : 'visibility'}
											</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="h-8 w-8 {post.liked
												? 'text-red-500 hover:text-red-600'
												: 'text-muted-foreground'}"
											onclick={() => onToggleLike(post.id)}
											title="좋아요 토글"
										>
											<span class="material-icons-round text-lg">
												{post.liked ? 'favorite' : 'favorite_border'}
											</span>
										</Button>
									</div>
								</TableCell>
								<TableCell class="text-right">
									<Button
										variant="outline"
										size="sm"
										class="h-8 text-xs"
										onclick={() => onOpenLink(post.url)}
									>
										Open
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>
	</div>
</div>
