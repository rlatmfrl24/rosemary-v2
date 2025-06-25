<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import type { TorrentItem } from '../types';
	import { enhance } from '$app/forms';

	interface Props {
		tableData: TorrentItem[];
		onRemoveItem: (line: string) => void;
		isLoading: boolean;
		isDateCountryUpdated: boolean;
		selectedCountry: string;
		trendDate: string;
		onUpdateSubmit: (params: {
			formData: FormData;
		}) => (params: { update: () => Promise<void>; result: any }) => Promise<void>;
		onResetSubmit: (params: {
			formData: FormData;
		}) => (params: { update: () => Promise<void>; result: any }) => Promise<void>;
	}

	let {
		tableData,
		onRemoveItem,
		isLoading,
		isDateCountryUpdated,
		selectedCountry,
		trendDate,
		onUpdateSubmit,
		onResetSubmit
	}: Props = $props();
</script>

<div class="flex flex-col gap-4 w-full h-0 flex-auto">
	<div class="border overflow-auto flex-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16">Rank</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head class="w-24">BTDig</Table.Head>
					<Table.Head class="w-24">Delete</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each tableData as row (row.line)}
					<Table.Row>
						<Table.Cell class="font-mono">{row.rank}</Table.Cell>
						<Table.Cell class="max-w-0 truncate" title={row.line}>
							{row.line}
						</Table.Cell>
						<Table.Cell>
							<Button size="sm" onclick={() => window.open(row.searchUrl, '_blank')}>Search</Button>
						</Table.Cell>
						<Table.Cell>
							<Button size="sm" variant="destructive" onclick={() => onRemoveItem(row.line)}>
								Delete
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-2 border-t pt-4">
		<form method="post" action="?/update" use:enhance={onUpdateSubmit}>
			<Button type="submit" disabled={isLoading || isDateCountryUpdated}>
				{isLoading ? 'Updating...' : 'Update'}
			</Button>
		</form>

		<form method="post" action="?/reset" use:enhance={onResetSubmit}>
			<input type="hidden" name="date" value={trendDate} />
			<input type="hidden" name="country" value={selectedCountry} />
			<Button type="submit" variant="destructive" disabled={isLoading}>
				{isLoading ? 'Resetting...' : 'Reset'}
			</Button>
		</form>
	</div>
</div>
