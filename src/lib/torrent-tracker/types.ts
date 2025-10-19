export interface TorrentItem {
	rank: number;
	line: string;
	searchUrl: string;
}

export interface TorrentHistoryData {
	name: string;
	country: string;
	date: string;
	rank: number;
}

export interface TorrentTrackerHistory {
	date: string;
	country: string;
	rank: number;
	name: string;
}

export interface CountryStatus {
	isUpdated: boolean;
	isChecking: boolean;
	hasChecked: boolean;
}

export const COUNTRIES = ['KR', 'US', 'JP', 'CN'] as const;
export type Country = (typeof COUNTRIES)[number];

export const URLS = {
	btDig: 'https://bt4gprx.com/search?q=',
	iKnowWhatYouDownload: 'https://iknowwhatyoudownload.com/en/stat/'
} as const;

export const DEFAULT_DATE_OFFSET = 2;
