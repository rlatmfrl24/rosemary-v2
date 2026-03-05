import { describe, expect, it } from 'vitest';
import type { DailyCheckItemView } from '$lib/daily-check/types';
import {
	getReminderDispatchCandidatesFromViews,
	normalizeReminderOffsetMinutes,
	parseDefaultReminderOffsetMinutes
} from './reminder-dispatch';

const baseItem = {
	id: 1,
	title: '출석',
	kind: 'daily_quest',
	importance: 'normal',
	url: '',
	notes: null,
	estimatedMinutes: 10,
	resetTimes: ['09:00'],
	timeZone: 'Asia/Seoul',
	pushReminderEnabled: true,
	pushReminderOffsetMinutes: null,
	completionCycleKey: null,
	completedAt: null,
	createdAt: 0,
	updatedAt: 0,
	currentCycleKey: '2026-03-05#09:00',
	activeResetTime: '09:00',
	isCompleted: false,
	cycleStartedAt: Date.parse('2026-03-05T00:00:00.000Z'),
	minutesPastReset: 0,
	minutesUntilReset: 0,
	nextResetAt: 0
} satisfies DailyCheckItemView;

function withOverrides(overrides: Partial<DailyCheckItemView>): DailyCheckItemView {
	return { ...baseItem, ...overrides };
}

describe('reminder dispatch utils', () => {
	it('uses fallback default offset when env value is invalid', () => {
		expect(parseDefaultReminderOffsetMinutes(undefined)).toBe(15);
		expect(parseDefaultReminderOffsetMinutes('abc')).toBe(15);
		expect(parseDefaultReminderOffsetMinutes('0')).toBe(15);
	});

	it('normalizes item offset with default fallback', () => {
		expect(normalizeReminderOffsetMinutes(null, 15)).toBe(15);
		expect(normalizeReminderOffsetMinutes(30, 15)).toBe(30);
		expect(normalizeReminderOffsetMinutes(0, 15)).toBe(15);
	});

	it('skips items before due time and includes due items', () => {
		const notDue = withOverrides({
			id: 10,
			cycleStartedAt: Date.parse('2026-03-05T00:00:00.000Z'),
			pushReminderOffsetMinutes: 30
		});
		const due = withOverrides({
			id: 11,
			cycleStartedAt: Date.parse('2026-03-05T00:00:00.000Z'),
			pushReminderOffsetMinutes: 5
		});

		const candidates = getReminderDispatchCandidatesFromViews([notDue, due], {
			now: new Date('2026-03-05T00:15:00.000Z'),
			defaultOffsetMinutes: 15
		});
		expect(candidates).toHaveLength(1);
		expect(candidates[0]?.item.id).toBe(11);
	});

	it('excludes disabled and completed items', () => {
		const disabled = withOverrides({ id: 20, pushReminderEnabled: false });
		const completed = withOverrides({ id: 21, isCompleted: true, completionCycleKey: '2026-03-05#09:00' });

		const candidates = getReminderDispatchCandidatesFromViews([disabled, completed], {
			now: new Date('2026-03-05T01:00:00.000Z'),
			defaultOffsetMinutes: 15
		});
		expect(candidates).toHaveLength(0);
	});

	it('deduplicates by item and cycle key', () => {
		const item = withOverrides({ id: 30, currentCycleKey: '2026-03-05#09:00' });
		const candidates = getReminderDispatchCandidatesFromViews([item], {
			now: new Date('2026-03-05T01:00:00.000Z'),
			defaultOffsetMinutes: 15,
			sentLogs: [{ itemId: 30, cycleKey: '2026-03-05#09:00' }]
		});
		expect(candidates).toHaveLength(0);
	});
});
