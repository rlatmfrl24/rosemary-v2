<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { DateValue } from '@internationalized/date';
	import { enhance, deserialize } from '$app/forms';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

	// 모듈화된 imports
	import {
		TorrentTrackerState,
		parseTrendRaw,
		convertToHistoryData,
		COUNTRIES,
		type Country
	} from '$lib/torrent-tracker';
	import { CountryStatusPanel, TorrentTable, InputSection } from '$lib/torrent-tracker/components';

	// 상태 관리
	const state = new TorrentTrackerState();

	// Computed values
	const formattedDate = $derived(state.trendDate ? state.trendDate.toString() : 'Select a date');

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
				state.resetState();
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

	const handleReset = ({ formData }: { formData: FormData }) => {
		state.isLoading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: any }) => {
			await update();
			if (result.type === 'success') {
				state.updateCountryStatus(state.selectedCountry, { isUpdated: false });
				state.resetState();
			}
			state.isLoading = false;
		};
	};

	const checkAllCountriesStatus = async () => {
		if (!state.trendDate || state.checkInProgress) return;

		state.checkInProgress = true;

		// 모든 국가 상태를 checking으로 설정
		COUNTRIES.forEach((country: Country) => {
			state.updateCountryStatus(country, { isChecking: true });
		});

		try {
			const formData = new FormData();
			formData.append('date', state.trendDate.toString());

			const response = await fetch('?/checkAllCountriesStatus', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());

			if (result.type === 'success' && result.data && 'statusMap' in result.data) {
				const statusMap = result.data.statusMap as Record<string, boolean>;

				COUNTRIES.forEach((country: Country) => {
					state.updateCountryStatus(country, {
						isUpdated: statusMap[country] || false,
						isChecking: false,
						hasChecked: true
					});
				});
			} else {
				// 오류 처리
				COUNTRIES.forEach((country: Country) => {
					state.updateCountryStatus(country, {
						isUpdated: false,
						isChecking: false,
						hasChecked: true
					});
				});
			}
		} catch (error) {
			console.error('Error checking countries status:', error);
			// 오류 시 모든 국가를 미완료로 처리
			COUNTRIES.forEach((country: Country) => {
				state.updateCountryStatus(country, {
					isUpdated: false,
					isChecking: false,
					hasChecked: true
				});
			});
		} finally {
			state.checkInProgress = false;
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
	<div class="flex items-center justify-between">
		<h1 class="text-4xl font-bold">Torrent Tracker</h1>
		<!-- Control buttons -->
		<div class="flex items-center gap-2 flex-wrap">
			<form method="post" action="?/clearDB" use:enhance={handleClearDB}>
				<Button type="submit" disabled={state.isLoading}>Clear All DB</Button>
			</form>
		</div>
	</div>

	<!-- 국가별 업데이트 상태 표시 -->
	<CountryStatusPanel
		{formattedDate}
		trendDate={state.trendDate}
		countryStatuses={state.countryStatuses}
		checkInProgress={state.checkInProgress}
		onCheckAll={checkAllCountriesStatus}
		onDateChange={(date: DateValue | undefined) => {
			if (date) state.trendDate = date;
		}}
		onCountrySelect={(country: Country) => {
			state.selectedCountry = country;
		}}
	/>

	{#if !state.hasTableData}
		<!-- Input section -->
		<InputSection
			selectedCountry={state.selectedCountry}
			{formattedDate}
			raw={state.raw}
			isCheckingDB={state.isCheckingDB}
			hasCheckedDB={state.hasCheckedDB}
			isDateCountryUpdated={state.isDateCountryUpdated}
			onCountryChange={(country: Country) => {
				state.selectedCountry = country;
			}}
			onRawChange={(value) => {
				state.raw = value;
			}}
			onParseSubmit={handleCheckUpdated}
		/>
	{:else}
		<!-- Results section -->
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<Button
					size="icon"
					variant="outline"
					onclick={state.resetState}
					class="hover:bg-gray-50 transition-colors"
					title="뒤로 가기"
				>
					<ChevronLeftIcon class="size-4" />
				</Button>
				<div class="flex flex-col">
					<h2 class="text-xl font-bold text-gray-900 leading-tight">
						{state.selectedCountry} Trend
					</h2>
					<p class="text-sm text-gray-500">{formattedDate}</p>
				</div>
			</div>

			<div class="flex items-center">
				<div
					class={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
						state.isDateCountryUpdated
							? 'bg-green-50 text-green-700 border-green-200'
							: 'bg-amber-50 text-amber-700 border-amber-200'
					}`}
				>
					<div
						class={`w-2 h-2 rounded-full mr-2 ${
							state.isDateCountryUpdated ? 'bg-green-500' : 'bg-amber-500'
						}`}
					></div>
					{state.isDateCountryUpdated ? 'Updated' : 'Pending Update'}
				</div>
			</div>
		</div>

		<!-- Table container -->
		<TorrentTable
			tableData={state.tableData}
			onRemoveItem={state.removeTableItem}
			isLoading={state.isLoading}
			isDateCountryUpdated={state.isDateCountryUpdated}
			selectedCountry={state.selectedCountry}
			trendDate={state.trendDate!.toString()}
			onUpdateSubmit={handleUpdate}
			onResetSubmit={handleReset}
		/>
	{/if}
</div>
