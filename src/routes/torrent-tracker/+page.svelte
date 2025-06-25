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

	interface CountryStatus {
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

	// 국가별 상태 관리 - 객체 기반으로 변경하여 반응성 개선
	let countryStatusMap = $state<Record<string, CountryStatus>>(
		COUNTRIES.reduce(
			(acc, country) => {
				acc[country] = {
					isUpdated: false,
					isChecking: false,
					hasChecked: false
				};
				return acc;
			},
			{} as Record<string, CountryStatus>
		)
	);

	// 체크 상태 관리
	let checkAllForm = $state<HTMLFormElement>();
	let checkInProgress = $state(false);

	// Computed values
	const hasTableData = $derived(tableData.length > 0);
	const formattedDate = $derived(
		trendDate ? dateFormatter.format(trendDate.toDate(getLocalTimeZone())) : 'Select a date'
	);

	// 현재 선택된 국가의 상태 - 객체에서 직접 접근
	const selectedCountryStatus = $derived(countryStatusMap[selectedCountry]);
	const isDateCountryUpdated = $derived(selectedCountryStatus?.isUpdated || false);
	const isCheckingDB = $derived(selectedCountryStatus?.isChecking || false);
	const hasCheckedDB = $derived(selectedCountryStatus?.hasChecked || false);

	// 전체 상태를 위한 배열 - 객체에서 파생
	const countryStatuses = $derived(
		COUNTRIES.map((country) => ({
			country,
			...countryStatusMap[country]
		}))
	);

	// 전체 상태 체크 - 객체 값들로 계산
	const isAnyCountryChecking = $derived(
		Object.values(countryStatusMap).some((status) => status.isChecking)
	);
	const allCountriesChecked = $derived(
		Object.values(countryStatusMap).every((status) => status.hasChecked)
	);

	// Utility functions
	const resetState = () => {
		raw = '';
		tableData = [];
	};

	// 상태 초기화 - 새로운 객체 생성으로 최적화
	const resetCountryStatuses = () => {
		countryStatusMap = COUNTRIES.reduce(
			(acc, country) => {
				acc[country] = {
					isUpdated: false,
					isChecking: false,
					hasChecked: false
				};
				return acc;
			},
			{} as Record<string, CountryStatus>
		);

		checkInProgress = false;
	};

	// 특정 국가 상태 업데이트 - 객체 업데이트로 반응성 개선
	const updateCountryStatus = (country: string, updates: Partial<CountryStatus>) => {
		if (countryStatusMap[country]) {
			countryStatusMap = {
				...countryStatusMap,
				[country]: {
					...countryStatusMap[country],
					...updates
				}
			};
		}
	};

	// URL 생성 함수 - 메모이제이션으로 최적화
	const createSearchUrl = (line: string) => URLS.btDig + encodeURIComponent(line);

	const parseTrendRaw = () => {
		const lines = raw
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

		// 한 번의 순회로 모든 데이터 생성
		tableData = lines.map((line, index) => ({
			rank: index + 1,
			line,
			searchUrl: createSearchUrl(line)
		}));
		raw = '';
	};

	const openCountryDaily = (country: (typeof COUNTRIES)[number]) => {
		selectedCountry = country;
		raw = '';
		tableData = [];
		window.open(`${URLS.iKnowWhatYouDownload}${country}/daily`, '_blank');
	};

	// 배열 필터링 최적화
	const removeTableItem = (lineToRemove: string) => {
		const index = tableData.findIndex((item) => item.line === lineToRemove);
		if (index !== -1) {
			tableData = [...tableData.slice(0, index), ...tableData.slice(index + 1)];
		}
	};

	// Form handlers
	const handleCheckUpdated = ({ formData }: { formData: FormData }) => {
		if (raw.trim()) {
			parseTrendRaw();
		}
		formData.append('date', trendDate.toString());
		formData.append('country', selectedCountry);

		return async ({ result }: { result: any }) => {
			let isUpdated = false;

			if (
				result.type === 'success' &&
				result.data &&
				typeof result.data === 'object' &&
				'isUpdated' in result.data
			) {
				isUpdated = (result.data as { isUpdated: boolean }).isUpdated;
			}

			// 항상 상태를 업데이트하여 "확인됨" 상태로 만듦
			updateCountryStatus(selectedCountry, { isUpdated, hasChecked: true });
		};
	};

	// 모든 국가 상태를 일괄 조회하는 핸들러
	const createCheckAllHandler = () => {
		return ({ formData }: { formData: FormData }) => {
			// 모든 국가를 확인 중 상태로 설정
			COUNTRIES.forEach((country) => {
				updateCountryStatus(country, { isChecking: true });
			});

			formData.append('date', trendDate.toString());

			return async ({ result }: { result: any }) => {
				checkInProgress = false;

				if (
					result.type === 'success' &&
					result.data &&
					typeof result.data === 'object' &&
					'statusMap' in result.data
				) {
					const statusMap = (result.data as { statusMap: Record<string, boolean> }).statusMap;

					// 모든 국가 상태를 한 번에 업데이트
					COUNTRIES.forEach((country) => {
						updateCountryStatus(country, {
							isUpdated: statusMap[country] || false,
							isChecking: false,
							hasChecked: true
						});
					});
				} else {
					// 에러 발생시 모든 국가를 확인 완료 상태로 설정
					COUNTRIES.forEach((country) => {
						updateCountryStatus(country, {
							isUpdated: false,
							isChecking: false,
							hasChecked: true
						});
					});
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

	// 모든 국가 상태 확인 - 일괄 조회로 단순화
	const checkAllCountriesStatus = () => {
		if (!trendDate || checkInProgress) return;

		checkInProgress = true;

		// Form이 준비되었는지 확인 후 실행
		if (checkAllForm) {
			checkAllForm.requestSubmit();
		} else {
			// Form이 아직 준비되지 않은 경우 다시 시도
			setTimeout(() => {
				if (checkAllForm && checkInProgress) {
					checkAllForm.requestSubmit();
				} else {
					checkInProgress = false;
				}
			}, 50);
		}
	};

	// 이전 값 추적 - 단순화
	let prevTrendDate = $state<string>('');
	let isInitialized = $state(false);

	// Effects - 날짜 변경 감지 최적화
	$effect(() => {
		const currentDateString = trendDate?.toString() || '';

		if (prevTrendDate !== currentDateString) {
			prevTrendDate = currentDateString;

			if (trendDate) {
				resetCountryStatuses();

				// 초기화 후 약간의 지연을 두고 체크 시작
				setTimeout(
					() => {
						if (!checkInProgress) {
							checkAllCountriesStatus();
						}
					},
					isInitialized ? 100 : 300
				); // 초기 로드시 더 긴 지연

				isInitialized = true;
			}
		}
	});

	// cleanup 함수 - 메모리 누수 방지
	$effect(() => {
		return () => {
			// 진행 중인 체크 중단
			checkInProgress = false;
		};
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
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-lg font-semibold">
				{formattedDate} 국가별 업데이트 상태
			</h3>
			<Button
				size="sm"
				variant="outline"
				onclick={checkAllCountriesStatus}
				disabled={checkInProgress}
			>
				{checkInProgress ? '확인 중...' : '전체 상태 확인'}
			</Button>
		</div>
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
						<span class="text-xs text-gray-400">미확인</span>
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

		<!-- Hidden form for batch country status checking -->
		<form
			bind:this={checkAllForm}
			method="post"
			action="?/checkAllCountriesStatus"
			use:enhance={createCheckAllHandler()}
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
