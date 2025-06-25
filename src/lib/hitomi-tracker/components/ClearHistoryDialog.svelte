<script lang="ts">
	import { enhance } from '$app/forms';
	import { buttonVariants } from '@/lib/components/ui/button';
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

	interface Props {
		isLoading: boolean;
		isClearHistoryLoading: boolean;
		clearHistoryEnhanceHandler: () => ({
			update
		}: {
			update: () => Promise<void>;
		}) => Promise<void>;
	}

	const { isLoading, isClearHistoryLoading, clearHistoryEnhanceHandler }: Props = $props();

	let isDialogOpen = $state(false);
</script>

<AlertDialog bind:open={isDialogOpen}>
	<AlertDialogTrigger
		type="submit"
		name="action"
		value="clearHistory"
		disabled={isLoading}
		class={buttonVariants()}
	>
		Clear history
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<form method="post" action="?/clearHistory" use:enhance={clearHistoryEnhanceHandler}>
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
