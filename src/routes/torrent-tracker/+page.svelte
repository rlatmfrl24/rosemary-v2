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
	import { enhance } from '$app/forms';

	// Types
	interface TorrentItem {
		rank: number;
		line: string;
		searchUrl: string;
	}

	interface TorrentHistoryData {
		name: string;
		country: string;
		date: string;
		rank: number;
	}

	// Constants
	const COUNTRIES = ['KR', 'US', 'JP', 'CN'] as const;
	const URLS = {
		btDig: 'https://btdig.com/search?q=',
		iKnowWhatYouDownload: 'https://iknowwhatyoudownload.com/en/stat/'
	} as const;

	const DEFAULT_DATE_OFFSET = 2;

	// Date formatter
	const dateFormatter = new DateFormatter('en-US', { dateStyle: 'long' });

	// State
	let tableData = $state<TorrentItem[]>([]);
	let trendDate = $state<DateValue>(
		new CalendarDate(
			new Date().getFullYear(),
			new Date().getMonth() + 1,
			new Date().getDate() - DEFAULT_DATE_OFFSET
		)
	);
	let raw = $state('');
	let isLoading = $state(false);
	let isDateCountryUpdated = $state(false);
	let selectedCountry = $state<(typeof COUNTRIES)[number]>('KR');

	// Computed values
	const hasTableData = $derived(tableData.length > 0);
	const formattedDate = $derived(
		trendDate ? dateFormatter.format(trendDate.toDate(getLocalTimeZone())) : 'Select a date'
	);

	// Utility functions
	const resetState = () => {
		raw = '';
		tableData = [];
		isDateCountryUpdated = false;
	};

	const parseTrendRaw = () => {
		const lines = raw
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

		tableData = lines.map((line, index) => ({
			rank: index + 1,
			line,
			searchUrl: URLS.btDig + encodeURIComponent(line)
		}));
		raw = '';
	};

	const openCountryDaily = (country: (typeof COUNTRIES)[number]) => {
		selectedCountry = country;
		resetState();
		window.open(`${URLS.iKnowWhatYouDownload}${country}/daily`, '_blank');
	};

	const removeTableItem = (lineToRemove: string) => {
		tableData = tableData.filter((item) => item.line !== lineToRemove);
	};

	// Form handlers
	const handleCheckUpdated = ({ formData }: { formData: FormData }) => {
		parseTrendRaw();
		formData.append('date', trendDate.toString());
		formData.append('country', selectedCountry);

		return async ({ result }: { result: any }) => {
			if (
				result.type === 'success' &&
				result.data &&
				typeof result.data === 'object' &&
				'isUpdated' in result.data
			) {
				isDateCountryUpdated = (result.data as { isUpdated: boolean }).isUpdated;
			}
		};
	};

	const handleUpdate = ({ formData }: { formData: FormData }) => {
		isLoading = true;
		const historyData: TorrentHistoryData[] = tableData.map((item) => ({
			name: item.line,
			country: selectedCountry,
			date: trendDate.toString(),
			rank: item.rank
		}));
		formData.append('data', JSON.stringify(historyData));

		return async ({ update, result }: { update: () => Promise<void>; result: any }) => {
			await update();
			if (result.type === 'success') {
				isDateCountryUpdated = true;
			}
			isLoading = false;
		};
	};

	const handleClearDB = () => {
		isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isLoading = false;
		};
	};

	// Effects
	$effect(() => {
		// Reset update status when date or country changes
		trendDate;
		selectedCountry;
		isDateCountryUpdated = false;
	});
</script>

<div class="flex flex-col h-full p-4 gap-4">
	<h1 class="text-4xl font-bold">Torrent Tracker</h1>

	<!-- Control buttons -->
	<div class="flex items-center gap-2 flex-wrap">
		{#each COUNTRIES as country}
			<Button type="button" onclick={() => openCountryDaily(country)}>
				{country} Daily
			</Button>
		{/each}

		<form method="post" action="?/clearDB" use:enhance={handleClearDB}>
			<Button type="submit" disabled={isLoading}>Clear All DB</Button>
		</form>
	</div>

	{#if !hasTableData}
		<!-- Input section -->
		<div class="flex gap-2 flex-wrap">
			<Select.Root type="single" bind:value={selectedCountry}>
				<Select.Trigger>{selectedCountry}</Select.Trigger>
				<Select.Content>
					{#each COUNTRIES as country}
						<Select.Item value={country}>{country}</Select.Item>
					{/each}
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
							{formattedDate}
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0">
					<Calendar bind:value={trendDate} type="single" initialFocus />
				</Popover.Content>
			</Popover.Root>
		</div>

		<Textarea placeholder="Enter your text here" bind:value={raw} />

		<form method="post" action="?/checkAlreadyUpdated" use:enhance={handleCheckUpdated}>
			<Button type="submit">Check</Button>
		</form>
	{:else}
		<!-- Results section -->
		<div class="flex items-center justify-between gap-2 flex-wrap">
			<h2 class="text-2xl font-bold">{formattedDate} {selectedCountry} Trend</h2>

			<div class="flex items-center gap-4">
				<span class="text-sm font-medium">
					Status: <span class={isDateCountryUpdated ? 'text-green-600' : 'text-yellow-600'}>
						{isDateCountryUpdated ? 'Already updated' : 'Not updated'}
					</span>
				</span>

				<Button onclick={resetState}>Reset</Button>
			</div>
		</div>

		<!-- Table container -->
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
								<Button size="sm" onclick={() => window.open(row.searchUrl, '_blank')}>
									Search
								</Button>
							</Table.Cell>
							<Table.Cell>
								<Button size="sm" variant="destructive" onclick={() => removeTableItem(row.line)}>
									Delete
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Action buttons -->
		<div class="flex gap-2">
			<form method="post" action="?/update" use:enhance={handleUpdate}>
				<Button type="submit" disabled={isLoading || isDateCountryUpdated}>
					{isLoading ? 'Updating...' : 'Update'}
				</Button>
			</form>
		</div>
	{/if}
</div>
