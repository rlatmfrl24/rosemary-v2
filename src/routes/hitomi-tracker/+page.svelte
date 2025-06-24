<script lang="ts">
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { onMount, onDestroy } from 'svelte';

	import type { PageData } from './$types';
	import { createSvelteTable, FlexRender } from '@/lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { new_item_list } from '@/lib/server/db/schema';
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

	export let data: PageData;

	type HitomiItem = typeof new_item_list.$inferSelect;

	let isLoading = false;
	let isClearHistoryLoading = false;
	let isDialogOpen = false;
	let currentTime = new Date();
	let timeInterval: NodeJS.Timeout;

	// 실시간 시간 업데이트
	onMount(() => {
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000); // 1초마다 업데이트
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	});

	// 시간 포맷팅 함수
	function formatLastCrawlTime(timestamp: number | string | null, referenceTime: Date): string {
		if (!timestamp) return '크롤링 기록이 없습니다';

		let date: Date;

		// Unix timestamp (초 단위)를 Date 객체로 변환
		if (typeof timestamp === 'number') {
			date = new Date(timestamp * 1000);
		} else if (typeof timestamp === 'string') {
			// 문자열인 경우 숫자로 변환 후 처리
			const numTimestamp = parseInt(timestamp, 10);
			if (isNaN(numTimestamp)) {
				return '시간 형식 오류';
			}
			date = new Date(numTimestamp * 1000);
		} else {
			return '시간 형식 오류';
		}

		// 유효한 날짜인지 확인
		if (isNaN(date.getTime())) {
			return '시간 형식 오류';
		}

		// 실시간 현재 시간 사용
		const diffMs = referenceTime.getTime() - date.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMinutes < 1) return '방금 전';
		if (diffMinutes < 60) return `${diffMinutes}분 전`;
		if (diffHours < 24) return `${diffHours}시간 전`;
		if (diffDays < 7) return `${diffDays}일 전`;

		// 일주일이 지난 경우 절대 시간 표시
		return date.toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// 반응형 상태: currentTime이 변경될 때마다 자동으로 재계산
	$: formattedLastCrawlTime = formatLastCrawlTime(data.lastCrawlTime, currentTime);

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

	// Clear history 전용 enhance 핸들러
	function createClearHistoryEnhanceHandler() {
		return () => {
			isClearHistoryLoading = true;
			return async ({ update }: { update: () => Promise<void> }) => {
				await update();
				isClearHistoryLoading = false;
				isDialogOpen = false; // Dialog 닫기
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
		<div class="flex flex-col">
			<h1 class="text-4xl font-bold">Hitomi Tracker</h1>
			<p class="text-sm text-muted-foreground">
				마지막 크롤링: {formattedLastCrawlTime}
			</p>
		</div>

		<div class="flex justify-between items-center flex-1">
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

				<form method="post" action="?/callCrawlApi" use:enhance={createEnhanceHandler()}>
					<Button type="submit" name="action" value="callCrawlApi" disabled={isLoading}>
						Call crawl API
					</Button>
				</form>
			</div>

			<AlertDialog bind:open={isDialogOpen}>
				<AlertDialogTrigger>
					<Button type="submit" name="action" value="clearHistory" disabled={isLoading}>
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
						<form
							method="post"
							action="?/clearHistory"
							use:enhance={createClearHistoryEnhanceHandler()}
						>
							<AlertDialogAction
								type="submit"
								name="action"
								value="clearHistory"
								disabled={isClearHistoryLoading}
							>
								{#if isClearHistoryLoading}
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
