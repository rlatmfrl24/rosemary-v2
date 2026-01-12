<script lang="ts">
	import { onMount } from 'svelte';

	export let date: Date | null | undefined = undefined;

	let now = new Date();
	let mounted = false;

	onMount(() => {
		mounted = true;
		now = new Date();
		const interval = setInterval(() => {
			now = new Date();
		}, 60000);
		return () => clearInterval(interval);
	});

	function calculate(d: Date, current: Date) {
		const diffMs = current.getTime() - d.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);
		const isStale = diffHours >= 12;

		let text = '방금 전';
		if (diffDays > 0) text = `${diffDays}일 전`;
		else if (diffHours > 0) text = `${diffHours}시간 전`;
		else {
			const diffMins = Math.floor(diffMs / (1000 * 60));
			if (diffMins > 0) text = `${diffMins}분 전`;
		}

		return { text, isStale };
	}

	$: result =
		date && mounted ? calculate(date, now) : { text: date ? '...' : '기록 없음', isStale: false };
</script>

<div class="flex items-center gap-1 text-xs">
	<span class="text-muted-foreground">
		최신 수집: {result.text}
	</span>
	{#if result.isStale}
		<span class="text-destructive font-bold" title="12시간 이상 경과됨">⚠</span>
	{/if}
</div>

{#if result.isStale}
	<p class="text-[10px] text-destructive font-medium">재수집 권장 (>12h)</p>
{/if}
