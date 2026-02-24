import { describe, expect, it } from 'vitest';
import { formatLastCrawlTime, getCrawlStatusLabel, parseTimestamp } from './utils';

describe('hitomi-tracker utils', () => {
	it('returns running label for in-progress crawl', () => {
		expect(getCrawlStatusLabel('running')).toBe('진행 중');
		expect(formatLastCrawlTime(null, new Date(), 'running')).toBe('크롤링 진행 중');
	});

	it('parses unix timestamp in seconds', () => {
		const date = parseTimestamp(1700000000);
		expect(date).not.toBeNull();
		expect(date?.getUTCFullYear()).toBeGreaterThanOrEqual(2023);
	});
});
