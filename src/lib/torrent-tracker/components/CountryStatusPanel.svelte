<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CountryStatus } from '../types';

	interface Props {
		formattedDate: string;
		countryStatuses: (CountryStatus & { country: string })[];
		checkInProgress: boolean;
		onCheckAll: () => void;
	}

	let { formattedDate, countryStatuses, checkInProgress, onCheckAll }: Props = $props();
</script>

<div class="border rounded-md p-4 bg-gray-50">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-lg font-semibold">
			{formattedDate} 국가별 업데이트 상태
		</h3>
		<Button size="sm" variant="outline" onclick={onCheckAll} disabled={checkInProgress}>
			{checkInProgress ? '확인 중...' : '전체 상태 확인'}
		</Button>
	</div>
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		{#each countryStatuses as status (status.country)}
			<div class="flex items-center justify-between p-3 bg-white rounded border">
				<span class="font-medium text-gray-700">{status.country}</span>
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
