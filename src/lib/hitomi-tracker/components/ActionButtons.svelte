<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '@/lib/components/ui/button/button.svelte';
	import * as AlertDialog from '@/lib/components/ui/alert-dialog';
	import type { HitomiItem } from '@/lib/hitomi-tracker';

	interface Props {
		items: HitomiItem[];
		isLoading: boolean;
		crawlError: string | null;
		onCopyCodesClick: () => void;
		onCrawlErrorDismiss: () => void;
		normalEnhanceHandler: () => ({ update }: { update: () => Promise<void> }) => Promise<void>;
		crawlEnhanceHandler: () => ({
			result,
			update
		}: {
			result: {
				type: string;
				data?: {
					success?: boolean;
					error?: string;
				};
			};
			update: () => Promise<void>;
		}) => Promise<void>;
	}

	const {
		items,
		isLoading,
		crawlError,
		onCopyCodesClick,
		onCrawlErrorDismiss,
		normalEnhanceHandler,
		crawlEnhanceHandler
	}: Props = $props();
</script>

<div class="flex flex-row gap-2 items-center">
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

	<div class="flex items-center gap-2">
		<form method="post" action="?/callCrawlApi" use:enhance={crawlEnhanceHandler}>
			<Button type="submit" name="action" value="callCrawlApi" disabled={isLoading}>
				Call Fetch Crawl API
			</Button>
		</form>

		<form method="post" action="?/callCrawlBrowserApi" use:enhance={crawlEnhanceHandler}>
			<Button type="submit" name="action" value="callCrawlBrowserApi" disabled={isLoading}>
				Call Browser Crawl API
			</Button>
		</form>

		{#if crawlError}
			<AlertDialog.Root open={!!crawlError}>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>크롤링 실패</AlertDialog.Title>
						<AlertDialog.Description>
							크롤링 중 오류가 발생했습니다:
							<br />
							<span class="text-destructive font-medium">{crawlError}</span>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Action onclick={onCrawlErrorDismiss}>확인</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
</div>
