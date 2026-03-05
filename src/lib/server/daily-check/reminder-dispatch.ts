import type { DailyCheckItemView } from '$lib/daily-check/types';

export const DEFAULT_PUSH_REMINDER_OFFSET_MINUTES = 15;
const MIN_REMINDER_OFFSET_MINUTES = 1;
const MAX_REMINDER_OFFSET_MINUTES = 1440;

export interface ReminderLogKey {
	itemId: number;
	cycleKey: string;
}

export interface ReminderDispatchCandidate {
	item: DailyCheckItemView;
	cycleKey: string;
	effectiveOffsetMinutes: number;
	dueAt: number;
}

export function parseDefaultReminderOffsetMinutes(raw: string | undefined): number {
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return DEFAULT_PUSH_REMINDER_OFFSET_MINUTES;
	const normalized = Math.floor(parsed);
	if (
		normalized < MIN_REMINDER_OFFSET_MINUTES ||
		normalized > MAX_REMINDER_OFFSET_MINUTES
	) {
		return DEFAULT_PUSH_REMINDER_OFFSET_MINUTES;
	}
	return normalized;
}

export function normalizeReminderOffsetMinutes(
	offsetMinutes: number | null | undefined,
	defaultOffsetMinutes: number
): number {
	const fallback = parseDefaultReminderOffsetMinutes(String(defaultOffsetMinutes));
	if (offsetMinutes === null || offsetMinutes === undefined) return fallback;
	if (!Number.isFinite(offsetMinutes)) return fallback;
	const normalized = Math.floor(offsetMinutes);
	if (
		normalized < MIN_REMINDER_OFFSET_MINUTES ||
		normalized > MAX_REMINDER_OFFSET_MINUTES
	) {
		return fallback;
	}
	return normalized;
}

export function getReminderDispatchCandidatesFromViews(
	items: DailyCheckItemView[],
	options: {
		now: Date;
		defaultOffsetMinutes: number;
		sentLogs?: ReminderLogKey[];
	}
): ReminderDispatchCandidate[] {
	const sentSet = new Set(
		(options.sentLogs ?? []).map((entry) => `${entry.itemId}:${entry.cycleKey}`)
	);
	const nowMs = options.now.getTime();

	const candidates: ReminderDispatchCandidate[] = [];
	for (const item of items) {
		if (item.isCompleted) continue;
		if (!item.pushReminderEnabled) continue;

		const effectiveOffsetMinutes = normalizeReminderOffsetMinutes(
			item.pushReminderOffsetMinutes,
			options.defaultOffsetMinutes
		);
		const dueAt = item.cycleStartedAt + effectiveOffsetMinutes * 60 * 1000;
		if (nowMs < dueAt) continue;
		if (sentSet.has(`${item.id}:${item.currentCycleKey}`)) continue;

		candidates.push({
			item,
			cycleKey: item.currentCycleKey,
			effectiveOffsetMinutes,
			dueAt
		});
	}

	return candidates;
}
