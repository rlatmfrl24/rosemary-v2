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

	// 국가별 상태 인터페이스 추가
	interface CountryStatus {
		country: string;
		isUpdated: boolean;
		isChecking: boolean;
		hasChecked: boolean;
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
	let selectedCountry = $state<(typeof COUNTRIES)[number]>('KR');

	// 통합된 국가별 업데이트 상태 관리
	let countryStatuses = $state<CountryStatus[]>(
		COUNTRIES.map((country) => ({
			country,
			isUpdated: false,
			isChecking: false,
			hasChecked: false
		}))
	);

	// 단일 재사용 form 참조
	let universalCheckForm = $state<HTMLFormElement>();
	let pendingChecks = $state<string[]>([]);

	// Computed values
	const hasTableData = $derived(tableData.length > 0);
	const formattedDate = $derived(
		trendDate ? dateFormatter.format(trendDate.toDate(getLocalTimeZone())) : 'Select a date'
	);

	// 선택된 국가의 상태 (기존 isDateCountryUpdated 대체)
	const selectedCountryStatus = $derived(
		countryStatuses.find((status) => status.country === selectedCountry)
	);
	const isDateCountryUpdated = $derived(selectedCountryStatus?.isUpdated || false);
	const isCheckingDB = $derived(selectedCountryStatus?.isChecking || false);
	const hasCheckedDB = $derived(selectedCountryStatus?.hasChecked || false);

	// 전체 상태 체크
	const isAnyCountryChecking = $derived(countryStatuses.some((status) => status.isChecking));
	const allCountriesChecked = $derived(countryStatuses.every((status) => status.hasChecked));

	// Utility functions
	const resetState = () => {
		raw = '';
		tableData = [];
		resetCountryStatuses();
	};

	// 모든 국가의 업데이트 상태를 초기화하는 함수
	const resetCountryStatuses = () => {
		countryStatuses = COUNTRIES.map((country) => ({
			country,
			isUpdated: false,
			isChecking: false,
			hasChecked: false
		}));
	};

	// 특정 국가의 상태를 업데이트하는 헬퍼 함수
	const updateCountryStatus = (
		country: string,
		updates: Partial<Omit<CountryStatus, 'country'>>
	) => {
		countryStatuses = countryStatuses.map((status) =>
			status.country === country ? { ...status, ...updates } : status
		);
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
		if (raw.trim()) {
			parseTrendRaw();
		}
		formData.append('date', trendDate.toString());
		formData.append('country', selectedCountry);

		return async ({ result }: { result: any }) => {
			if (
				result.type === 'success' &&
				result.data &&
				typeof result.data === 'object' &&
				'isUpdated' in result.data
			) {
				const isUpdated = (result.data as { isUpdated: boolean }).isUpdated;
				updateCountryStatus(selectedCountry, { isUpdated, hasChecked: true });
			}
		};
	};

	// 통합된 DB 체크 핸들러
	const createUniversalCheckHandler = (targetCountry?: string) => {
		return ({ formData }: { formData: FormData }) => {
			const country = targetCountry || pendingChecks[0];
			if (!country) return;

			updateCountryStatus(country, { isChecking: true });
			formData.append('date', trendDate.toString());
			formData.append('country', country);

			return async ({ result }: { result: any }) => {
				if (
					result.type === 'success' &&
					result.data &&
					typeof result.data === 'object' &&
					'isUpdated' in result.data
				) {
					const isUpdated = (result.data as { isUpdated: boolean }).isUpdated;
					updateCountryStatus(country, { isUpdated, isChecking: false, hasChecked: true });
				} else {
					updateCountryStatus(country, { isChecking: false, hasChecked: true });
				}

				// 대기 중인 다음 국가 체크
				if (!targetCountry) {
					pendingChecks = pendingChecks.slice(1);
					if (pendingChecks.length > 0) {
						setTimeout(() => universalCheckForm?.requestSubmit(), 50);
					}
				}
			};
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
				updateCountryStatus(selectedCountry, { isUpdated: true });
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

	// 선택된 국가의 상태 확인
	const checkSelectedCountry = () => {
		if (!trendDate || !selectedCountry || isCheckingDB) return;

		// 기존 상태 초기화
		updateCountryStatus(selectedCountry, { hasChecked: false });

		// 대기열에 추가하고 체크 시작
		pendingChecks = [selectedCountry];
		universalCheckForm?.requestSubmit();
	};

	// 모든 국가의 업데이트 여부를 확인하는 함수 (병렬 처리)
	const checkAllCountriesStatus = () => {
		if (!trendDate) return;

		resetCountryStatuses();

		// 모든 국가를 대기열에 추가
		pendingChecks = [...COUNTRIES];

		// 첫 번째 국가 체크 시작
		if (pendingChecks.length > 0) {
			universalCheckForm?.requestSubmit();
		}
	};

	// Effects - 통합된 단일 effect
	$effect(() => {
		if (trendDate) {
			// 선택된 국가 체크와 전체 국가 체크를 순차적으로 실행
			setTimeout(() => {
				if (selectedCountry) {
					checkSelectedCountry();
				}
			}, 100);

			setTimeout(() => {
				checkAllCountriesStatus();
			}, 200);
		}
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

	<!-- 국가별 업데이트 상태 표시 -->
	<div class="border rounded-md p-4 bg-gray-50">
		<h3 class="text-lg font-semibold mb-3">
			{formattedDate} 국가별 업데이트 상태
		</h3>
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{#each countryStatuses as status (status.country)}
				<div class="flex items-center justify-between p-3 bg-white rounded border">
					<span class="font-medium text-gray-700">{status.country}</span>
					{#if status.isChecking}
						<span class="text-xs text-blue-600 animate-pulse">확인 중...</span>
					{:else if status.hasChecked}
						<span
							class={status.isUpdated
								? 'text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium'
								: 'text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-medium'}
						>
							{status.isUpdated ? '✓ 완료' : '✗ 미완료'}
						</span>
					{:else}
						<span class="text-xs text-gray-400">대기 중</span>
					{/if}
				</div>
			{/each}
		</div>
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
			<!-- Database status -->
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-gray-700">데이터베이스 상태:</span>
				{#if isCheckingDB}
					<span class="text-sm font-medium text-blue-600 animate-pulse">조회 중...</span>
				{:else if hasCheckedDB}
					<span class="text-sm font-medium">
						<span
							class={isDateCountryUpdated
								? 'text-green-600 bg-green-50 px-2 py-1 rounded'
								: 'text-red-600 bg-red-50 px-2 py-1 rounded'}
						>
							{isDateCountryUpdated ? '✓ 이미 업데이트됨' : '✗ 아직 업데이트되지 않음'}
						</span>
					</span>
				{:else}
					<span class="text-sm font-medium text-gray-500">대기 중...</span>
				{/if}
			</div>
		</div>

		<!-- Universal hidden form for all country status checking -->
		<form
			bind:this={universalCheckForm}
			method="post"
			action="?/checkAlreadyUpdated"
			use:enhance={createUniversalCheckHandler()}
			style="display: none;"
		>
			<button type="submit" tabindex="-1">Hidden Submit</button>
		</form>

		<Textarea placeholder="텍스트를 입력하세요" bind:value={raw} />

		<form method="post" action="?/checkAlreadyUpdated" use:enhance={handleCheckUpdated}>
			<Button type="submit" disabled={!raw.trim()}>확인</Button>
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
			<Button onclick={resetState}>Reset</Button>
		</div>
	{/if}
</div>
