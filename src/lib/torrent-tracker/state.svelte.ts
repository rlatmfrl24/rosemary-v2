import type { DateValue } from '@internationalized/date';
import { CalendarDate } from '@internationalized/date';
import type { TorrentItem, CountryStatus, Country } from './types';
import { COUNTRIES, DEFAULT_DATE_OFFSET } from './types';

export class TorrentTrackerState {
	tableData = $state<TorrentItem[]>([]);
	trendDate = $state<DateValue>(
		new CalendarDate(
			new Date().getFullYear(),
			new Date().getMonth() + 1,
			new Date().getDate() - DEFAULT_DATE_OFFSET
		)
	);
	raw = $state('');
	isLoading = $state(false);
	isDialogOpen = $state(false);
	selectedCountry = $state<Country>('KR');

	countryStatusMap = $state<Record<string, CountryStatus>>(
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

	checkInProgress = $state(false);
	prevTrendDate = $state<string>('');
	isInitialized = $state(false);

	// Computed values
	hasTableData = $derived(this.tableData.length > 0);
	selectedCountryStatus = $derived(this.countryStatusMap[this.selectedCountry]);
	isDateCountryUpdated = $derived(this.selectedCountryStatus?.isUpdated || false);
	isCheckingDB = $derived(this.selectedCountryStatus?.isChecking || false);
	hasCheckedDB = $derived(this.selectedCountryStatus?.hasChecked || false);

	countryStatuses = $derived(
		COUNTRIES.map((country) => ({
			country,
			...this.countryStatusMap[country]
		}))
	);

	isAnyCountryChecking = $derived(
		Object.values(this.countryStatusMap).some((status) => status.isChecking)
	);

	allCountriesChecked = $derived(
		Object.values(this.countryStatusMap).every((status) => status.hasChecked)
	);

	// Methods
	resetState = () => {
		this.raw = '';
		this.tableData = [];
	};

	resetCountryStatuses = () => {
		this.countryStatusMap = COUNTRIES.reduce(
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
		this.checkInProgress = false;
	};

	updateCountryStatus = (country: string, updates: Partial<CountryStatus>) => {
		if (this.countryStatusMap[country]) {
			this.countryStatusMap = {
				...this.countryStatusMap,
				[country]: {
					...this.countryStatusMap[country],
					...updates
				}
			};
		}
	};

	removeTableItem = (lineToRemove: string) => {
		const index = this.tableData.findIndex((item) => item.line === lineToRemove);
		if (index !== -1) {
			this.tableData = [...this.tableData.slice(0, index), ...this.tableData.slice(index + 1)];
		}
	};
}
