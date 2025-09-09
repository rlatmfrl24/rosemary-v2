<script lang="ts">
	import type { PageData } from './$types';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '@/lib/components/ui/button';
	import { ScrollArea } from '@/lib/components/ui/scroll-area';
	import { enhance } from '$app/forms';
	import { Checkbox } from '@/lib/components/ui/checkbox';

	export let data: PageData;

	interface TorrentTrendItem {
		name: string;
		countries: string[];
		dates: string[];
		ranks: number[];
		bestRank: number;
		totalEntries: number;
		avgRank: number;
		downloaded: boolean;
		downloadedAt: string | null;
		torrentTrackerId: number;
		trendScore: number;
	}

	$: trendData = data.trendData as TorrentTrendItem[];

	// 표시할 항목 수 관리
	let showAll = false;
	const initialLimit = 50;

	$: displayedData = showAll ? trendData : trendData.slice(0, initialLimit);
	$: hasMoreItems = trendData.length > initialLimit;

	function formatCountries(countries: string[]): string {
		if (countries.length <= 2) {
			return countries.join(', ');
		}
		return `${countries.slice(0, 2).join(', ')} 외 ${countries.length - 2}개국`;
	}

	function formatDates(dates: string[]): string {
		if (dates.length <= 2) {
			return dates.join(', ');
		}
		const firstDate = dates[0];
		const lastDate = dates[dates.length - 1];
		return `${firstDate} ~ ${lastDate} (${dates.length}회)`;
	}

	function formatRanks(ranks: number[]): string {
		const min = Math.min(...ranks);
		const max = Math.max(...ranks);
		if (min === max) {
			return `${min}위`;
		}
		return `${min}위 ~ ${max}위`;
	}

	function getRankBadgeClass(rank: number): string {
		if (rank <= 3) return 'bg-yellow-100 text-yellow-800';
		if (rank <= 10) return 'bg-blue-100 text-blue-800';
		if (rank <= 20) return 'bg-green-100 text-green-800';
		return 'bg-gray-100 text-gray-800';
	}

	function formatDownloadDate(dateString: string | null): string {
		if (!dateString) return '-';
		return dateString;
	}

	async function handleDownloadStatusChange(torrentTrackerId: number, downloaded: boolean) {
		const formData = new FormData();
		formData.append('torrentTrackerId', torrentTrackerId.toString());
		formData.append('downloaded', downloaded.toString());

		try {
			const response = await fetch('?/updateDownloadStatus', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// 페이지 새로고침하여 최신 데이터 반영
				window.location.reload();
			} else {
				console.error('다운로드 상태 업데이트 실패');
			}
		} catch (error) {
			console.error('다운로드 상태 업데이트 중 오류:', error);
		}
	}

	function toggleShowAll() {
		showAll = !showAll;
	}
</script>

<div class="container mx-auto p-6 flex flex-col h-full">
	<div class="mb-4">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Torrent Trend</h1>
		<p class="text-gray-600">토렌트 트래커 히스토리를 기반으로 한 인기 토렌트 순위표</p>
		<div class="flex items-center gap-4 mt-1">
			<p class="text-sm text-gray-500">총 {trendData.length}개의 토렌트 항목</p>
			{#if !showAll && hasMoreItems}
				<p class="text-sm text-blue-600">상위 {initialLimit}개 표시 중</p>
			{/if}
		</div>
	</div>

	{#if trendData.length > 0}
		<div class="bg-white rounded-lg shadow h-0 flex-auto flex flex-col">
			<!-- 고정적 헤더 -->
			<div class="border-b bg-gray-50 flex-shrink-0">
				<Table.Root class="table-fixed">
					<Table.Header>
						<Table.Row class="bg-gray-50">
							<Table.Head class="w-12 text-center font-bold">순위</Table.Head>
							<Table.Head class="min-w-[200px] font-bold">토렌트 이름</Table.Head>
							<Table.Head class="w-24 font-bold text-center">최고 순위</Table.Head>
							<Table.Head class="w-24 font-bold text-center">평균 순위</Table.Head>
							<Table.Head class="w-32 font-bold text-center">순위 범위</Table.Head>
							<Table.Head class="w-24 font-bold text-center">등장 국가</Table.Head>
							<Table.Head class="w-56 font-bold">등장 기간</Table.Head>
							<Table.Head class="w-20 text-center font-bold">등장 횟수</Table.Head>
							<Table.Head class="w-20 text-center font-bold">트렌드 점수</Table.Head>
							<Table.Head class="w-20 text-center font-bold">BTDig</Table.Head>
							<Table.Head class="w-32 text-center font-bold">다운로드 일자</Table.Head>
							<Table.Head class="w-24 text-center font-bold">다운로드</Table.Head>
						</Table.Row>
					</Table.Header>
				</Table.Root>
			</div>

			<!-- 스크롤 가능한 바디 -->
			<ScrollArea class="flex-1 overflow-auto">
				<Table.Root class="table-fixed">
					<Table.Body>
						{#each displayedData as item, index}
							<Table.Row
								class="hover:bg-gray-50 {item.totalEntries >= 5
									? 'bg-yellow-50 border-l-4 border-yellow-400'
									: ''}"
							>
								<Table.Cell class="w-12 text-center font-medium">
									{index + 1}
								</Table.Cell>
								<Table.Cell class="min-w-[200px] font-medium max-w-0 truncate" title={item.name}>
									{item.name}
								</Table.Cell>
								<Table.Cell class="w-24 text-center">
									<span
										class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRankBadgeClass(
											item.bestRank
										)}"
									>
										{item.bestRank}위
									</span>
								</Table.Cell>
								<Table.Cell class="w-24 text-center">
									<span class="text-sm text-gray-600">
										{item.avgRank}위
									</span>
								</Table.Cell>
								<Table.Cell class="w-32 text-center">
									<span class="text-sm text-gray-600">
										{formatRanks(item.ranks)}
									</span>
								</Table.Cell>
								<Table.Cell class="w-24">
									<div class="text-sm text-gray-600" title={item.countries.join(', ')}>
										{formatCountries(item.countries)}
									</div>
								</Table.Cell>
								<Table.Cell class="w-56">
									<div class="text-sm text-gray-600" title={item.dates.join(', ')}>
										{formatDates(item.dates)}
									</div>
								</Table.Cell>
								<Table.Cell class="w-20 text-center">
									<span
										class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
									>
										{item.totalEntries}
									</span>
								</Table.Cell>
								<Table.Cell class="w-20 text-center">
									<span class="text-sm text-gray-600">
										{item.trendScore.toFixed(3)}
									</span>
								</Table.Cell>
								<Table.Cell class="w-20 text-center">
									<Button
										size="sm"
										onclick={() =>
											window.open(
												`https://btdig.com/search?q=${encodeURIComponent(item.name)}`,
												'_blank'
											)}
									>
										BTDig
									</Button>
								</Table.Cell>

								<Table.Cell class="w-32 text-center">
									<span
										class="text-sm {item.downloadedAt
											? 'text-green-600 font-medium'
											: 'text-gray-400'}"
									>
										{formatDownloadDate(item.downloadedAt)}
									</span>
								</Table.Cell>

								<Table.Cell class="w-24">
									<div class="flex justify-center">
										<Checkbox
											checked={item.downloaded}
											onCheckedChange={(checked) =>
												handleDownloadStatusChange(item.torrentTrackerId, checked)}
										/>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</ScrollArea>
		</div>

		<!-- Expand/Collapse 버튼 -->
		{#if hasMoreItems}
			<div class="flex justify-center mt-4">
				<Button variant="outline" onclick={toggleShowAll} class="px-8 py-2">
					{#if showAll}
						📋 상위 {initialLimit}개만 보기 ({trendData.length - initialLimit}개 숨기기)
					{:else}
						📊 전체 {trendData.length}개 보기 (+{trendData.length - initialLimit}개 더보기)
					{/if}
				</Button>
			</div>
		{/if}
	{:else}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<div class="text-gray-400 text-lg mb-2">📊</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
			<p class="text-gray-500">아직 토렌트 트래커 히스토리 데이터가 없습니다.</p>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1500px;
	}
</style>
