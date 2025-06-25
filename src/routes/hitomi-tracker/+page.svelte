<script lang="ts">
	import { getCoreRowModel } from '@tanstack/table-core';
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';
	import { createSvelteTable, FlexRender } from '@/lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import Button from '@/lib/components/ui/button/button.svelte';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '@/lib/components/ui/alert-dialog';
	import { ScrollArea } from '@/lib/components/ui/scroll-area';

	// Hitomi tracker 모듈에서 필요한 것들 import
	import {
		type HitomiItem,
		formatLastCrawlTime,
		HITOMI_TABLE_COLUMNS,
		useCurrentTime,
		useLoadingState,
		createEnhanceHandler,
		createClearHistoryEnhanceHandler,
		handleCopyCodesClick,
		handleRowClick,
		handleKeyDown
	} from '@/lib/hitomi-tracker';

	const { data }: { data: PageData } = $props();

	// 커스텀 훅 사용
	const currentTime = useCurrentTime(60000); // 1분마다 업데이트
	const loadingState = useLoadingState();

	// Dialog 상태
	let isDialogOpen = $state(false);

	// 반응형 상태: currentTime이 변경될 때마다 자동으로 재계산
	const formattedLastCrawlTime = $derived(
		formatLastCrawlTime(data.lastCrawlTime, currentTime.current)
	);

	// 테이블 인스턴스 생성
	const table = createSvelteTable({
		get data() {
			return data.new_item_list;
		},
		columns: HITOMI_TABLE_COLUMNS,
		getCoreRowModel: getCoreRowModel()
	});

	// Enhance 핸들러들
	const normalEnhanceHandler = createEnhanceHandler(loadingState.setLoading);
	const clearHistoryEnhanceHandler = createClearHistoryEnhanceHandler(
		loadingState.setClearHistoryLoading,
		() => (isDialogOpen = false)
	);

	// 액션 핸들러들
	const onCopyCodesClick = () => handleCopyCodesClick(data.new_item_list);
	const onRowClick = (item: HitomiItem) => handleRowClick(item);
	const onKeyDown = (event: KeyboardEvent, item: HitomiItem) => handleKeyDown(event, item);
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
			<div class="flex flex-row gap-2">
				<Button onclick={onCopyCodesClick} disabled={data.new_item_list.length === 0}>
					Copy codes to clipboard
				</Button>

				<form method="post" action="?/clearNewItems" use:enhance={normalEnhanceHandler}>
					<Button
						type="submit"
						name="action"
						value="clearNewItems"
						disabled={loadingState.isLoading || data.new_item_list.length === 0}
					>
						Clear new items
					</Button>
				</form>

				<form method="post" action="?/callCrawlApi" use:enhance={normalEnhanceHandler}>
					<Button
						type="submit"
						name="action"
						value="callCrawlApi"
						disabled={loadingState.isLoading}
					>
						Call crawl API
					</Button>
				</form>
			</div>

			<AlertDialog bind:open={isDialogOpen}>
				<AlertDialogTrigger>
					<Button
						type="submit"
						name="action"
						value="clearHistory"
						disabled={loadingState.isLoading}
					>
						Clear history
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<form method="post" action="?/clearHistory" use:enhance={clearHistoryEnhanceHandler}>
							<AlertDialogAction
								type="submit"
								name="action"
								value="clearHistory"
								disabled={loadingState.isClearHistoryLoading}
							>
								{#if loadingState.isClearHistoryLoading}
									<div class="flex items-center gap-2">
										<div
											class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-4 w-4"
										></div>
										<span>Processing...</span>
									</div>
								{:else}
									Confirm
								{/if}
							</AlertDialogAction>
						</form>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	</div>

	<div class="flex h-0 flex-auto flex-col rounded-md border overflow-hidden">
		{#if loadingState.isLoading}
			<div class="flex h-full flex-row items-center justify-center gap-4">
				<div
					class="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-8 w-8"
				></div>
				<p>Loading...</p>
			</div>
		{:else}
			<!-- 고정 헤더 -->
			<div class="border-b bg-background">
				<Table.Root style="width: 100%; table-layout: fixed;">
					<Table.Header>
						{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head
										style="width: {header.column.getSize()}px"
										class="border-b font-bold bg-gray-50"
									>
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
				</Table.Root>
			</div>

			<!-- 스크롤 가능한 테이블 바디 -->
			<ScrollArea class="flex-1 overflow-y-auto">
				<Table.Root style="width: 100%; table-layout: fixed;">
					<Table.Body>
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row
								data-state={row.getIsSelected() && 'selected'}
								class="cursor-pointer hover:bg-muted/50 transition-colors"
								onclick={() => onRowClick(row.original)}
								role="button"
								tabindex={0}
								onkeydown={(e) => onKeyDown(e, row.original)}
							>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="truncate" style="width: {cell.column.getSize()}px">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell
									colspan={HITOMI_TABLE_COLUMNS.length}
									class="h-24 text-center text-muted-foreground"
								>
									No results found.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</ScrollArea>
		{/if}
	</div>
</div>
