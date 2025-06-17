<script lang="ts">
import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import type { PageData } from "./$types";
import { createSvelteTable, FlexRender } from "@/lib/components/ui/data-table";
import * as Table from "$lib/components/ui/table";
import type { new_item_list } from "@/lib/server/db/schema";
import Button from "@/lib/components/ui/button/button.svelte";
import { enhance } from "$app/forms";

export let data: PageData;

// biome-ignore lint/style/useConst: <explanation>
let isClearNewItemsLoading = false;
// biome-ignore lint/style/useConst: <explanation>
let isClearHistoryLoading = false;
// biome-ignore lint/style/useConst: <explanation>
let isCallCrawlApiLoading = false;

type HitomiItem = typeof new_item_list.$inferSelect;

const columns: ColumnDef<HitomiItem>[] = [
	{
		header: "Code",
		accessorKey: "code",
		size: 40,
	},
	{
		header: "Name",
		accessorKey: "name",
		size: 320,
	},
	{
		header: "Type",
		accessorKey: "type",
		size: 40,
	},
	{
		header: "URL",
		accessorKey: "url",
		size: 120,
	},
	{
		header: "Created At",
		accessorKey: "createdAt",
		size: 100,
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
	<div class="flex flex-row gap-4">
		<h1 class="text-4xl font-bold">Hitomi Tracker</h1>
		<Button onclick={() => {
			// copy codes with break line
			const codes = data.new_item_list.map((item) => item.code).join("\n");
			navigator.clipboard.writeText(codes);
		}}>
			Copy to clipboard
		</Button>
		<form method="post" action="?/clearNewItems" use:enhance={()=>{
			isClearNewItemsLoading = true;
			return async ({update}) => {
				await update();
				isClearNewItemsLoading = false;
			}
		}}>
			<Button type="submit" name="action" value="clearNewItems" disabled={isClearNewItemsLoading}>
				Clear new items
			</Button>
		</form>
		<form method="post" action="?/clearHistory" use:enhance={()=>{
			isClearHistoryLoading = true;
			return async ({update}) => {
				await update();
				isClearHistoryLoading = false;
			}
		}}>
			<Button type="submit" name="action" value="clearHistory" disabled={isClearHistoryLoading}>
				Clear history
			</Button>
		</form>
		<form method="post" action="?/callCrawlApi" use:enhance={()=>{
			isCallCrawlApiLoading = true;
			return async ({update}) => {
				await update();
				isCallCrawlApiLoading = false;
			}
		}}>
			<Button type="submit" name="action" value="callCrawlApi" disabled={isCallCrawlApiLoading}>
				Call crawl API
			</Button>
		</form>
	</div>
	<div class="flex flex-col gap-4 border rounded-md p-4 w-full h-0 flex-auto">
		<Table.Root style="width: 100%; table-layout: fixed;">
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
				  {#each headerGroup.headers as header (header.id)}
					<Table.Head style="width: {header.column.getSize()}px">
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