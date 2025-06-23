<script lang="ts">
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	import type { PageData } from './$types';
	import { createSvelteTable, FlexRender } from '@/lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { new_item_list } from '@/lib/server/db/schema';

	export let data: PageData;

	type HitomiItem = typeof new_item_list.$inferSelect;

	let isLoading = false;

	// 컬럼 정의를 상수로 분리
	const columns: ColumnDef<HitomiItem>[] = [
		{
			header: 'Code',
			accessorKey: 'code',
			size: 40
		},
		{
			header: 'Name',
			accessorKey: 'name',
			size: 320
		},
		{
			header: 'Type',
			accessorKey: 'type',
			size: 40
		},
		{
			header: 'URL',
			accessorKey: 'url',
			size: 120
		},
		{
			header: 'Created At',
			accessorKey: 'createdAt',
			size: 100
		}
	];

	// 테이블 인스턴스 생성
	const table = createSvelteTable({
		get data() {
			return data.new_item_list;
		},
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	// 공통 enhance 함수로 중복 제거
	function createEnhanceHandler() {
		return () => {
			isLoading = true;
			return async ({ update }: { update: () => Promise<void> }) => {
				await update();
				isLoading = false;
			};
		};
	}

	// 코드 복사 기능 분리
	function handleCopyCodesClick() {
		const codes = data.new_item_list.map((item) => item.code).join('\n');
		navigator.clipboard.writeText(codes);
		toast.success('Codes copied to clipboard', {
			description: 'You can paste them into the search bar of Hitomi'
		});
	}

	// 행 클릭 핸들러 분리
	function handleRowClick(item: HitomiItem) {
		window.open(item.url, '_blank');
	}
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<div class="flex flex-row items-center gap-4">
		<h1 class="text-4xl font-bold">Hitomi Tracker</h1>

		<div class="flex flex-row gap-2">
			<Button onclick={handleCopyCodesClick} disabled={data.new_item_list.length === 0}>
				Copy codes to clipboard
			</Button>

			<form method="post" action="?/clearNewItems" use:enhance={createEnhanceHandler()}>
				<Button
					type="submit"
					name="action"
					value="clearNewItems"
					disabled={isLoading || data.new_item_list.length === 0}
				>
					Clear new items
				</Button>
			</form>

			<form method="post" action="?/clearHistory" use:enhance={createEnhanceHandler()}>
				<Button type="submit" name="action" value="clearHistory" disabled={isLoading}>
					Clear history
				</Button>
			</form>

			<form method="post" action="?/callCrawlApi" use:enhance={createEnhanceHandler()}>
				<Button type="submit" name="action" value="callCrawlApi" disabled={isLoading}>
					Call crawl API
				</Button>
			</form>
		</div>
	</div>

	<div class="flex h-0 flex-auto flex-col gap-4 rounded-md border p-4">
		{#if isLoading}
			<div class="flex h-full flex-row items-center justify-center gap-4">
				<div
					class="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-8 w-8"
				></div>
				<p>Loading...</p>
			</div>
		{:else}
			<Table.Root style="width: 100%; table-layout: fixed;">
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head style="width: {header.column.getSize()}px">
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

				<Table.Body>
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row
							data-state={row.getIsSelected() && 'selected'}
							class="cursor-pointer hover:bg-muted/50 transition-colors"
							onclick={() => handleRowClick(row.original)}
							role="button"
							tabindex={0}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleRowClick(row.original);
								}
							}}
						>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell class="truncate">
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
								No results found.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</div>
</div>
