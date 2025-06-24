<script lang="ts">
	import type { PageData } from './$types';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '@/lib/components/ui/button';

	export let data: PageData;

	$: trendData = data.trendData;

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
</script>

<div class="container mx-auto p-6 flex flex-col gap-4 h-full">
	<div class="mb-4">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Torrent Trend</h1>
		<p class="text-gray-600">토렌트 트래커 히스토리를 기반으로 한 인기 토렌트 순위표</p>
		<p class="text-sm text-gray-500 mt-1">총 {trendData.length}개의 토렌트 항목</p>
	</div>

	{#if trendData.length > 0}
		<div class="bg-white rounded-lg shadow h-0 flex-auto flex flex-col">
			<!-- 고정 헤더 -->
			<div class="border-b bg-gray-50 flex-shrink-0">
				<Table.Root>
					<Table.Header>
						<Table.Row class="bg-gray-50">
							<Table.Head class="w-12 text-center">순위</Table.Head>
							<Table.Head class="min-w-[200px]">토렌트 이름</Table.Head>
							<Table.Head class="w-32">최고 순위</Table.Head>
							<Table.Head class="w-32">평균 순위</Table.Head>
							<Table.Head class="w-40">순위 범위</Table.Head>
							<Table.Head class="w-48">등장 국가</Table.Head>
							<Table.Head class="w-56">등장 기간</Table.Head>
							<Table.Head class="w-20 text-center">등장 횟수</Table.Head>
							<Table.Head class="w-20 text-center">BTDig</Table.Head>
						</Table.Row>
					</Table.Header>
				</Table.Root>
			</div>

			<!-- 스크롤 가능한 바디 -->
			<div class="flex-1 overflow-auto">
				<Table.Root>
					<Table.Body>
						{#each trendData as item, index}
							<Table.Row class="hover:bg-gray-50">
								<Table.Cell class="w-12 text-center font-medium">
									{index + 1}
								</Table.Cell>
								<Table.Cell class="min-w-[200px] font-medium">
									<div class="max-w-xs truncate" title={item.name}>
										{item.name}
									</div>
								</Table.Cell>
								<Table.Cell class="w-32">
									<span
										class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRankBadgeClass(
											item.bestRank
										)}"
									>
										{item.bestRank}위
									</span>
								</Table.Cell>
								<Table.Cell class="w-32">
									<span class="text-sm text-gray-600">
										{item.avgRank}위
									</span>
								</Table.Cell>
								<Table.Cell class="w-40">
									<span class="text-sm text-gray-600">
										{formatRanks(item.ranks)}
									</span>
								</Table.Cell>
								<Table.Cell class="w-48">
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
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
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
		max-width: 1400px;
	}
</style>
