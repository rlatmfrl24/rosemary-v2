<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import Textarea from '@/lib/components/ui/textarea/textarea.svelte';
	import * as Popover from '@/lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		CalendarDate
	} from '@internationalized/date';
	import { Calendar } from '@/lib/components/ui/calendar';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import * as Select from '@/lib/components/ui/select';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let tableData: { line: string; searchUrl: string }[] = $state([]);
	// default trendDate is today - 2 days
	let trendDate = $state<DateValue>(
		new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 2)
	);
	let raw = $state('');
	const countries = ['KR', 'US', 'JP', 'CN'];
	let selectedCountry = $state('KR');
	const btDigURL = 'https://btdig.com/search?q=';
	const iKnowWhatYouDownloadURL = 'https://iknowwhatyoudownload.com/en/stat/';

	const parseTrendRaw = () => {
		const lines = raw.split('\n');

		const data: { line: string; searchUrl: string }[] = [];

		for (const line of lines) {
			if (line.trim() === '') continue;
			data.push({ line, searchUrl: btDigURL + encodeURIComponent(line) });
		}
		tableData = data;
		raw = '';
	};
</script>

<div class="flex flex-col h-full p-4 gap-4">
	<h1 class="text-4xl font-bold">Torrent Tracker</h1>
	<div class="flex items-center gap-2">
		{#each countries as country}
			<Button
				type="button"
				onclick={() => {
					selectedCountry = country;
					raw = '';
					tableData = [];
					window.open(iKnowWhatYouDownloadURL + country + '/daily', '_blank');
				}}
			>
				{country} Daily
			</Button>
		{/each}
	</div>

	{#if tableData.length === 0}
		<div class="flex gap-2">
			<Select.Root type="single" bind:value={selectedCountry}>
				<Select.Trigger>
					{selectedCountry}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="KR">KR</Select.Item>
					<Select.Item value="US">US</Select.Item>
					<Select.Item value="JP">JP</Select.Item>
					<Select.Item value="CN">CN</Select.Item>
				</Select.Content>
			</Select.Root>
			<Popover.Root>
				<Popover.Trigger class="w-fit">
					{#snippet child({ props })}
						<Button
							variant="outline"
							class={cn(
								'w-fit justify-start text-left font-normal',
								!trendDate && 'text-muted-foreground'
							)}
							{...props}
						>
							<CalendarIcon class="size-4" />
							{trendDate ? df.format(trendDate.toDate(getLocalTimeZone())) : 'Select a date'}
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0">
					<Calendar bind:value={trendDate} type="single" initialFocus />
				</Popover.Content>
			</Popover.Root>
		</div>
		<Textarea placeholder="Enter your text here" bind:value={raw} />
		<Button
			onclick={() => {
				parseTrendRaw();
			}}
		>
			Parse
		</Button>
	{:else if tableData.length > 0}
		<div class="flex items-center justify-between gap-2">
			<h2 class="text-2xl font-bold">{trendDate} {selectedCountry} Trend</h2>
			<Button
				onclick={() => {
					raw = '';
					tableData = [];
				}}
			>
				Reset
			</Button>
		</div>
		<div class="flex flex-col gap-4 border rounded-md p-4 w-full h-0 flex-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Rank</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>BTDig</Table.Head>
						<Table.Head>Delete</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each tableData as row, index}
						<Table.Row>
							<Table.Cell>{index + 1}</Table.Cell>
							<Table.Cell>{row.line}</Table.Cell>
							<Table.Cell>
								<Button
									onclick={() => {
										window.open(row.searchUrl, '_blank');
									}}
								>
									Search
								</Button>
							</Table.Cell>
							<Table.Cell>
								<Button
									onclick={() => {
										tableData = tableData.filter((item) => item.line !== row.line);
									}}
								>
									Delete
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		<Button>Update</Button>
	{/if}
</div>
