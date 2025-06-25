<script lang="ts">
	import { getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '@/lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import { ScrollArea } from '@/lib/components/ui/scroll-area';
	import {
		HITOMI_TABLE_COLUMNS,
		handleRowClick,
		handleKeyDown,
		type HitomiItem
	} from '@/lib/hitomi-tracker';

	interface Props {
		items: HitomiItem[];
		isLoading: boolean;
	}

	const { items, isLoading }: Props = $props();

	// 테이블 인스턴스 생성
	const table = createSvelteTable({
		get data() {
			return items;
		},
		columns: HITOMI_TABLE_COLUMNS,
		getCoreRowModel: getCoreRowModel()
	});

	// 액션 핸들러들
	const onRowClick = (item: HitomiItem) => handleRowClick(item);
	const onKeyDown = (event: KeyboardEvent, item: HitomiItem) => handleKeyDown(event, item);
</script>

<div class="flex h-0 flex-auto flex-col rounded-md border overflow-hidden">
	{#if isLoading}
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
