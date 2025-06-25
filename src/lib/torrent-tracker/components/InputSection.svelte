<script lang="ts">
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select';
	import type { Country } from '../types';
	import { COUNTRIES } from '../types';
	import { enhance } from '$app/forms';

	interface Props {
		selectedCountry: Country;
		formattedDate: string;
		raw: string;
		isCheckingDB: boolean;
		hasCheckedDB: boolean;
		isDateCountryUpdated: boolean;
		onCountryChange: (country: Country) => void;
		onRawChange: (value: string) => void;
		onParseSubmit: (params: { formData: FormData }) => (params: { result: any }) => Promise<void>;
	}

	let {
		selectedCountry,
		formattedDate,
		raw,
		isCheckingDB,
		hasCheckedDB,
		isDateCountryUpdated,
		onCountryChange,
		onRawChange,
		onParseSubmit
	}: Props = $props();
</script>

<div class="flex flex-col gap-2">
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

		<div class="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
			<span class="text-sm font-medium text-gray-700">선택된 날짜:</span>
			<span class="text-sm font-medium text-gray-900">{formattedDate}</span>
		</div>

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

	<form method="post" action="?/checkAlreadyUpdated" use:enhance={onParseSubmit}>
		<Button class="w-full" type="submit" disabled={!raw.trim()}>Parse</Button>
	</form>
</div>
