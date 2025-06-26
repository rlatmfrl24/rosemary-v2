<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { cn } from '$lib/utils.js';
	import type { DateValue } from '@internationalized/date';
	import type { CountryStatus, Country } from '../types';
	import { openCountryDaily } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button';

	interface Props {
		formattedDate: string;
		trendDate: DateValue | undefined;
		countryStatuses: (CountryStatus & { country: string })[];
		checkInProgress: boolean;
		onCheckAll: () => void;
		onDateChange: (date: DateValue | undefined) => void;
		onCountrySelect: (country: Country) => void;
	}

	let {
		formattedDate,
		trendDate,
		countryStatuses,
		checkInProgress,
		onCheckAll,
		onDateChange,
		onCountrySelect
	}: Props = $props();

	// 로컬 상태로 관리
	let localTrendDate = $state(trendDate);

	// trendDate가 변경될 때 로컬 상태 업데이트
	$effect(() => {
		localTrendDate = trendDate;
	});

	// 로컬 상태가 변경될 때 부모에게 알림
	const handleDateChange = (date: DateValue | undefined) => {
		localTrendDate = date;
		onDateChange(date);
	};
</script>

<div class="border rounded-md p-4 bg-gray-50">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<h3 class="text-lg font-semibold">국가별 업데이트 상태</h3>
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline', size: 'sm' }),
						'w-fit justify-start text-left font-normal',
						!localTrendDate && 'text-muted-foreground'
					)}
				>
					<CalendarIcon class="size-4" />
					{formattedDate}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0">
					<Calendar
						bind:value={localTrendDate}
						onValueChange={handleDateChange}
						type="single"
						initialFocus
					/>
				</Popover.Content>
			</Popover.Root>
		</div>
		<Button size="sm" variant="outline" onclick={onCheckAll} disabled={checkInProgress}>
			{checkInProgress ? '확인 중...' : '전체 상태 확인'}
		</Button>
	</div>
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
		{#each countryStatuses as status (status.country)}
			<div class="flex items-center justify-between p-3 bg-white rounded border">
				<div class="flex items-center gap-2">
					<span class="font-medium text-gray-700">{status.country}</span>
					<Button
						size="sm"
						variant="outline"
						class="h-6 px-2 text-xs"
						onclick={() => {
							const country = status.country as Country;
							onCountrySelect(country);
							openCountryDaily(country, localTrendDate?.toString());
						}}
					>
						Visit
					</Button>
				</div>
				{#if status.isChecking}
					<span class="text-xs text-blue-600 animate-pulse">확인 중...</span>
				{:else if status.hasChecked}
					<span
						class={status.isUpdated
							? 'text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium'
							: 'text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-medium'}
					>
						{status.isUpdated ? '✓ 완료' : '✗ 미완료'}
					</span>
				{:else}
					<span class="text-xs text-gray-400">미확인</span>
				{/if}
			</div>
		{/each}
	</div>
</div>
