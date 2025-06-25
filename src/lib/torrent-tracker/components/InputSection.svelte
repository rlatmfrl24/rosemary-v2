<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Calendar } from '$lib/components/ui/calendar';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { cn } from '$lib/utils.js';
	import type { DateValue } from '@internationalized/date';
	import type { Country } from '../types';
	import { COUNTRIES } from '../types';

	interface Props {
		selectedCountry: Country;
		trendDate: DateValue | undefined;
		formattedDate: string;
		raw: string;
		isCheckingDB: boolean;
		hasCheckedDB: boolean;
		isDateCountryUpdated: boolean;
		onCountryChange: (country: Country) => void;
		onDateChange: (date: DateValue | undefined) => void;
		onRawChange: (value: string) => void;
	}

	let {
		selectedCountry,
		trendDate,
		formattedDate,
		raw,
		isCheckingDB,
		hasCheckedDB,
		isDateCountryUpdated,
		onCountryChange,
		onDateChange,
		onRawChange
	}: Props = $props();
</script>

<div class="flex gap-2 flex-wrap">
	<Select.Root
		type="single"
		value={selectedCountry}
		onValueChange={(value) => onCountryChange(value as Country)}
	>
		<Select.Trigger>{selectedCountry}</Select.Trigger>
		<Select.Content>
			{#each COUNTRIES as country}
				<Select.Item value={country}>{country}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<Popover.Root>
		<Popover.Trigger class="w-fit">
			{#snippet child({ props })}
				<Button
					variant="outline"
					class={cn(
						'w-fit justify-start text-left font-normal',
						!trendDate && 'text-muted-foreground'
					)}
					{...props}
				>
					<CalendarIcon class="size-4" />
					{formattedDate}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<Calendar value={trendDate} onValueChange={onDateChange} type="single" initialFocus />
		</Popover.Content>
	</Popover.Root>

	<!-- Database status -->
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">데이터베이스 상태:</span>
		{#if isCheckingDB}
			<span class="text-sm font-medium text-blue-600 animate-pulse">조회 중...</span>
		{:else if hasCheckedDB}
			<span class="text-sm font-medium">
				<span
					class={isDateCountryUpdated
						? 'text-green-600 bg-green-50 px-2 py-1 rounded'
						: 'text-red-600 bg-red-50 px-2 py-1 rounded'}
				>
					{isDateCountryUpdated ? '✓ 이미 업데이트됨' : '✗ 아직 업데이트되지 않음'}
				</span>
			</span>
		{:else}
			<span class="text-sm font-medium text-gray-500">대기 중...</span>
		{/if}
	</div>
</div>

<Textarea
	placeholder="텍스트를 입력하세요"
	value={raw}
	oninput={(e) => {
		const target = e.target as HTMLTextAreaElement;
		if (target) onRawChange(target.value);
	}}
/>
