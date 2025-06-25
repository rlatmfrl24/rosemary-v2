<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { enhance } from '$app/forms';

	// 모듈화된 imports
	import {
		TorrentTrackerState,
		parseTrendRaw,
		convertToHistoryData,
		openCountryDaily,
		COUNTRIES,
		type Country
	} from '$lib/torrent-tracker';
	import { CountryStatusPanel, TorrentTable, InputSection } from '$lib/torrent-tracker/components';

	// 상태 관리
	const state = new TorrentTrackerState();

	// Date formatter
	const dateFormatter = new DateFormatter('en-US', { dateStyle: 'long' });

	// Computed values
	const formattedDate = $derived(
		state.trendDate
			? dateFormatter.format(state.trendDate.toDate(getLocalTimeZone()))
			: 'Select a date'
	);

	// Utility functions
	const parseTrendRawFromState = () => {
		state.tableData = parseTrendRaw(state.raw);
		state.raw = '';
	};

	// Form handlers
	const handleCheckUpdated = ({ formData }: { formData: FormData }) => {
		if (state.raw.trim()) {
			parseTrendRawFromState();
		}
		formData.append('date', state.trendDate!.toString());
		formData.append('country', state.selectedCountry);

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

			state.updateCountryStatus(state.selectedCountry, { isUpdated, hasChecked: true });
		};
	};

	const createCheckAllHandler = () => {
		return ({ formData }: { formData: FormData }) => {
			COUNTRIES.forEach((country: Country) => {
				state.updateCountryStatus(country, { isChecking: true });
			});

			formData.append('date', state.trendDate!.toString());

			return async ({ result }: { result: any }) => {
				state.checkInProgress = false;

				if (
					result.type === 'success' &&
					result.data &&
					typeof result.data === 'object' &&
					'statusMap' in result.data
				) {
					const statusMap = (result.data as { statusMap: Record<string, boolean> }).statusMap;

					COUNTRIES.forEach((country: Country) => {
						state.updateCountryStatus(country, {
							isUpdated: statusMap[country] || false,
							isChecking: false,
							hasChecked: true
						});
					});
				} else {
					COUNTRIES.forEach((country: Country) => {
						state.updateCountryStatus(country, {
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
		state.isLoading = true;
		const historyData = convertToHistoryData(
			state.tableData,
			state.selectedCountry,
			state.trendDate!.toString()
		);
		formData.append('data', JSON.stringify(historyData));

		return async ({ update, result }: { update: () => Promise<void>; result: any }) => {
			await update();
			if (result.type === 'success') {
				state.updateCountryStatus(state.selectedCountry, { isUpdated: true });
			}
			state.isLoading = false;
		};
	};

	const handleClearDB = () => {
		state.isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			state.isLoading = false;
		};
	};

	const checkAllCountriesStatus = () => {
		if (!state.trendDate || state.checkInProgress) return;

		state.checkInProgress = true;

		if (state.checkAllForm) {
			state.checkAllForm.requestSubmit();
		} else {
			setTimeout(() => {
				if (state.checkAllForm && state.checkInProgress) {
					state.checkAllForm.requestSubmit();
				} else {
					state.checkInProgress = false;
				}
			}, 50);
		}
	};

	// Effects
	$effect(() => {
		const currentDateString = state.trendDate?.toString() || '';

		if (state.prevTrendDate !== currentDateString) {
			state.prevTrendDate = currentDateString;

			if (state.trendDate) {
				state.resetCountryStatuses();

				setTimeout(
					() => {
						if (!state.checkInProgress) {
							checkAllCountriesStatus();
						}
					},
					state.isInitialized ? 100 : 300
				);

				state.isInitialized = true;
			}
		}
	});

	$effect(() => {
		return () => {
			state.checkInProgress = false;
		};
	});
</script>

<div class="flex flex-col h-full p-4 gap-4">
	<h1 class="text-4xl font-bold">Torrent Tracker</h1>
	<!-- 국가별 업데이트 상태 표시 -->
	<CountryStatusPanel
		{formattedDate}
		countryStatuses={state.countryStatuses}
		checkInProgress={state.checkInProgress}
		onCheckAll={checkAllCountriesStatus}
	/>

	<!-- Control buttons -->
	<div class="flex items-center gap-2 flex-wrap">
		{#each COUNTRIES as country}
			<Button type="button" onclick={() => openCountryDaily(country)}>
				{country} Daily
			</Button>
		{/each}

		<form method="post" action="?/clearDB" use:enhance={handleClearDB}>
			<Button type="submit" disabled={state.isLoading}>Clear All DB</Button>
		</form>
	</div>

	{#if !state.hasTableData}
		<!-- Input section -->
		<InputSection
			selectedCountry={state.selectedCountry}
			trendDate={state.trendDate}
			{formattedDate}
			raw={state.raw}
			isCheckingDB={state.isCheckingDB}
			hasCheckedDB={state.hasCheckedDB}
			isDateCountryUpdated={state.isDateCountryUpdated}
			onCountryChange={(country: Country) => {
				state.selectedCountry = country;
			}}
			onDateChange={(date) => {
				state.trendDate = date || state.trendDate;
			}}
			onRawChange={(value) => {
				state.raw = value;
			}}
		/>

		<!-- Hidden form for batch country status checking -->
		<form
			bind:this={state.checkAllForm}
			method="post"
			action="?/checkAllCountriesStatus"
			use:enhance={createCheckAllHandler()}
			style="display: none;"
		>
			<button type="submit" tabindex="-1">Hidden Submit</button>
		</form>

		<form method="post" action="?/checkAlreadyUpdated" use:enhance={handleCheckUpdated}>
			<Button type="submit" disabled={!state.raw.trim()}>확인</Button>
		</form>
	{:else}
		<!-- Results section -->
		<div class="flex items-center justify-between gap-2 flex-wrap">
			<h2 class="text-2xl font-bold">{formattedDate} {state.selectedCountry} Trend</h2>

			<div class="flex items-center gap-4">
				<span class="text-sm font-medium">
					Status: <span class={state.isDateCountryUpdated ? 'text-green-600' : 'text-yellow-600'}>
						{state.isDateCountryUpdated ? 'Already updated' : 'Not updated'}
					</span>
				</span>
			</div>
		</div>

		<!-- Table container -->
		<TorrentTable tableData={state.tableData} onRemoveItem={state.removeTableItem} />

		<!-- Action buttons -->
		<div class="flex gap-2">
			<form method="post" action="?/update" use:enhance={handleUpdate}>
				<Button type="submit" disabled={state.isLoading || state.isDateCountryUpdated}>
					{state.isLoading ? 'Updating...' : 'Update'}
				</Button>
			</form>
			<Button onclick={state.resetState}>Reset</Button>
		</div>
	{/if}
</div>
