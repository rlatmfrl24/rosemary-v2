<script lang="ts">
import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import type { PageData } from "./$types";
import { createSvelteTable, FlexRender } from "@/lib/components/ui/data-table";
import * as Table from "$lib/components/ui/table";
import type { new_item_list } from "@/lib/server/db/schema";

export let data: PageData;

type HitomiItem = typeof new_item_list.$inferSelect;

const columns: ColumnDef<HitomiItem>[] = [
	{
		header: "Code",
		accessorKey: "code",
	},
	{
		header: "Name",
		accessorKey: "name",
		size: 100,
	},
	{
		header: "Type",
		accessorKey: "type",
	},
	{
		header: "URL",
		accessorKey: "url",
	},
	{
		header: "Created At",
		accessorKey: "createdAt",
	},
];

const table = createSvelteTable({
	get data() {
		return data.new_item_list;
	},
	columns: columns,
	getCoreRowModel: getCoreRowModel(),
});
</script>

<div class="flex flex-col h-full p-4 gap-4">
	<h1 class="text-4xl font-bold">Hitomi Tracker</h1>
	<div class="flex flex-col gap-4 border rounded-md p-4 w-full">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
				  {#each headerGroup.headers as header (header.id)}
					<Table.Head>
					  {#if !header.isPlaceholder}
						<FlexRender
						  content={header.column.columnDef.header}
						  context={header.getContext()}
						/>
					  {/if}
					</Table.Head>
				  {/each}
				</Table.Row>
			  {/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && "selected"}>
				  {#each row.getVisibleCells() as cell (cell.id)}
					<Table.Cell class="truncate">
					  <FlexRender
						content={cell.column.columnDef.cell}
						context={cell.getContext()}
					  />
					</Table.Cell>
				  {/each}
				</Table.Row>
			  {:else}
				<Table.Row>
				  <Table.Cell colspan={columns.length} class="h-24 text-center">
					No results.
				  </Table.Cell>
				</Table.Row>
			  {/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>