<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import type { TorrentItem } from '../types';

	interface Props {
		tableData: TorrentItem[];
		onRemoveItem: (line: string) => void;
	}

	let { tableData, onRemoveItem }: Props = $props();
</script>

<div class="flex flex-col gap-4 border rounded-md p-4 w-full h-0 flex-auto overflow-auto">
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
