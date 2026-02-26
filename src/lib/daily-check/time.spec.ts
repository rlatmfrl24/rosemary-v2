import { describe, expect, it } from 'vitest';
import { buildDailyCheckItemView, getCurrentCycleKey, isValidResetTime, isValidTimeZone } from './time';
import type { DailyCheckItemRow } from './types';

const baseItem: DailyCheckItemRow = {
	id: 1,
	title: 'Sample',
	kind: 'daily_quest',
	importance: 'normal',
	url: 'https://example.com',
	notes: null,
	estimatedMinutes: 15,
	resetTimes: ['09:00'],
	timeZone: 'Asia/Seoul',
	completionCycleKey: null,
	completedAt: null,
	createdAt: 0,
	updatedAt: 0
};

describe('daily-check time utils', () => {
	it('returns same-day cycle key after reset time', () => {
		const now = new Date('2026-02-26T00:30:00.000Z'); // Asia/Seoul 09:30
		expect(getCurrentCycleKey(now, '09:00', 'Asia/Seoul')).toBe('2026-02-26#09:00');
	});

	it('returns previous-day cycle key before reset time', () => {
		const now = new Date('2026-02-25T23:30:00.000Z'); // Asia/Seoul 08:30
		expect(getCurrentCycleKey(now, '09:00', 'Asia/Seoul')).toBe('2026-02-25#09:00');
	});

	it('builds view with completion status by cycle key', () => {
		const now = new Date('2026-02-26T00:30:00.000Z');
		const completedItem: DailyCheckItemRow = {
			...baseItem,
			completionCycleKey: '2026-02-26#09:00'
		};
		const pendingItem: DailyCheckItemRow = {
			...baseItem,
			completionCycleKey: '2026-02-25#09:00'
		};

		const completedView = buildDailyCheckItemView(completedItem, now);
		const pendingView = buildDailyCheckItemView(pendingItem, now);
		expect(completedView.isCompleted).toBe(true);
		expect(pendingView.isCompleted).toBe(false);
		expect(pendingView.minutesPastReset).toBeGreaterThanOrEqual(0);
		expect(pendingView.cycleStartedAt).toBeLessThanOrEqual(now.getTime());
	});

	it('validates reset time and timezone formats', () => {
		expect(isValidResetTime('00:00')).toBe(true);
		expect(isValidResetTime('23:59')).toBe(true);
		expect(isValidResetTime('24:00')).toBe(false);
		expect(isValidTimeZone('Asia/Seoul')).toBe(true);
		expect(isValidTimeZone('Invalid/Zone')).toBe(false);
	});
});
