import type { TorrentItem, TorrentHistoryData, Country } from './types';
import { URLS } from './types';

export const createSearchUrl = (line: string): string => URLS.btDig + encodeURIComponent(line);

export const parseTrendRaw = (raw: string): TorrentItem[] => {
	const lines = raw
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	return lines.map((line, index) => ({
		rank: index + 1,
		line,
		searchUrl: createSearchUrl(line)
	}));
};

export const convertToHistoryData = (
	tableData: TorrentItem[],
	selectedCountry: Country,
	trendDate: string
): TorrentHistoryData[] => {
	return tableData.map((item) => ({
		name: item.line,
		country: selectedCountry,
		date: trendDate,
		rank: item.rank
	}));
};

export const openCountryDaily = (country: Country, date?: string): void => {
	const baseUrl = `${URLS.iKnowWhatYouDownload}${country}/daily`;
	const url = date ? `${baseUrl}/q?statDate=${date}` : baseUrl;
	window.open(url, '_blank');
};

export const removeItemFromArray = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
	const index = array.findIndex(predicate);
	if (index === -1) return array;
	return [...array.slice(0, index), ...array.slice(index + 1)];
};
