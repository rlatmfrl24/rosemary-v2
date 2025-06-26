<script lang="ts">
	import type { PageData } from './$types';

	// Hitomi tracker 모듈에서 필요한 것들 import
	import {
		formatLastCrawlTime,
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
		formatLastCrawlTime(data.lastCrawlTime, currentTime.current)
	);

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
		</div>

		<div class="flex justify-between items-center flex-1">
			<ActionButtons
				items={data.new_item_list}
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
</div>
