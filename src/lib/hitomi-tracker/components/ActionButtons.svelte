<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { HitomiItem } from '@/lib/hitomi-tracker';

	interface Props {
		items: HitomiItem[];
		isLoading: boolean;
		onCopyCodesClick: () => void;
		normalEnhanceHandler: () => ({ update }: { update: () => Promise<void> }) => Promise<void>;
	}

	const { items, isLoading, onCopyCodesClick, normalEnhanceHandler }: Props = $props();
</script>

<div class="flex flex-row gap-2">
	<Button onclick={onCopyCodesClick} disabled={items.length === 0}>Copy codes to clipboard</Button>

	<form method="post" action="?/clearNewItems" use:enhance={normalEnhanceHandler}>
		<Button
			type="submit"
			name="action"
			value="clearNewItems"
			disabled={isLoading || items.length === 0}
		>
			Clear new items
		</Button>
	</form>

	<form method="post" action="?/callCrawlApi" use:enhance={normalEnhanceHandler}>
		<Button type="submit" name="action" value="callCrawlApi" disabled={isLoading}>
			Call crawl API
		</Button>
	</form>
</div>
