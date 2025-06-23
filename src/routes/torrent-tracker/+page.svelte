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

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let tableData: { line: string; searchUrl: string }[] = $state([]);
	// default trendDate is today - 2 days
	let trendDate = $state<DateValue>(
		new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate() - 2)
	);
	let raw = $state('');
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
		<Button
			type="button"
			onclick={() => {
				window.open(iKnowWhatYouDownloadURL + 'KR/daily', '_blank');
			}}>KR Daily</Button
		>
		<Button
			type="button"
			onclick={() => {
				window.open(iKnowWhatYouDownloadURL + 'US/daily', '_blank');
			}}>US Daily</Button
		>
		<Button
			type="button"
			onclick={() => {
				window.open(iKnowWhatYouDownloadURL + 'JP/daily', '_blank');
			}}>JP Daily</Button
		>
		<Button
			type="button"
			onclick={() => {
				window.open(iKnowWhatYouDownloadURL + 'CN/daily', '_blank');
			}}>CN Daily</Button
		>
	</div>

	{#if tableData.length === 0}
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
			<h2 class="text-2xl font-bold">{trendDate} Trend</h2>
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
			<Table.Root class="w-full h-full">
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>BTDig</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each tableData as item}
						<Table.Row>
							<Table.Cell>{item.line}</Table.Cell>
							<Table.Cell>
								<Button
									onclick={() => {
										window.open(item.searchUrl, '_blank');
									}}
								>
									Search
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
