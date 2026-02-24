<script lang="ts">
	import type { PageData } from './$types';

	// Hitomi tracker 모듈에서 필요한 것들 import
	import {
		formatLastCrawlTime,
		getCrawlStatusLabel,
		useCurrentTime,
		useLoadingState,
		createEnhanceHandler,
		createCrawlEnhanceHandler,
		handleCopyCodesClick,
		ClearHistoryDialog,
		HitomiTable,
		ActionButtons
	} from '@/lib/hitomi-tracker';

	const { data }: { data: PageData } = $props();

	// 커스텀 훅 사용
	const currentTime = useCurrentTime(60000); // 1분마다 업데이트
	const loadingState = useLoadingState();

	// 반응형 상태: currentTime이 변경될 때마다 자동으로 재계산
	const formattedLastCrawlTime = $derived(
		formatLastCrawlTime(data.lastCrawl.completedAt, currentTime.current, data.lastCrawl.status)
	);
	const crawlStatusLabel = $derived(getCrawlStatusLabel(data.lastCrawl.status));

	// Enhance 핸들러들
	const normalEnhanceHandler = createEnhanceHandler(loadingState.setLoading);
	const crawlEnhanceHandler = createCrawlEnhanceHandler(
		loadingState.setLoading,
		loadingState.setCrawlError
	);

	// 액션 핸들러들
	const onCopyCodesClick = () => handleCopyCodesClick(data.new_item_list);
	const onCrawlErrorDismiss = () => loadingState.clearCrawlError();
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<div class="flex flex-row items-center gap-4">
		<div class="flex flex-col">
			<h1 class="text-4xl font-bold">Hitomi Tracker</h1>
			<p class="text-sm text-muted-foreground">
				마지막 크롤링: {formattedLastCrawlTime}
			</p>
			<p class="text-sm text-muted-foreground">
				상태: {crawlStatusLabel}
				{#if data.lastCrawl.status === 'failed' && data.lastCrawl.error}
					- {data.lastCrawl.error}
				{/if}
			</p>
		</div>

		<div class="flex justify-between items-center flex-1">
			<ActionButtons
				items={data.new_item_list}
				totalItems={data.pagination.totalItems}
				isLoading={loadingState.isLoading}
				crawlError={loadingState.crawlError}
				{onCopyCodesClick}
				{onCrawlErrorDismiss}
				{normalEnhanceHandler}
				{crawlEnhanceHandler}
			/>

			<ClearHistoryDialog
				isLoading={loadingState.isLoading}
				isClearHistoryLoading={loadingState.isClearHistoryLoading}
				setClearHistoryLoading={loadingState.setClearHistoryLoading}
			/>
		</div>
	</div>

	<HitomiTable items={data.new_item_list} isLoading={loadingState.isLoading} />

	<div class="flex items-center justify-between text-sm text-muted-foreground">
		<p>
			총 {data.pagination.totalItems}개 · 페이지 {data.pagination.page}/{data.pagination.totalPages}
		</p>
		<div class="flex items-center gap-3">
			{#if data.pagination.page > 1}
				<a href="?page={data.pagination.page - 1}" class="underline hover:no-underline">이전</a>
			{:else}
				<span class="opacity-50">이전</span>
			{/if}
			{#if data.pagination.page < data.pagination.totalPages}
				<a href="?page={data.pagination.page + 1}" class="underline hover:no-underline">다음</a>
			{:else}
				<span class="opacity-50">다음</span>
			{/if}
		</div>
	</div>
</div>
