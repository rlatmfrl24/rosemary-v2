import type { DailyCheckItemRow, DailyCheckItemView } from './types';

export const DEFAULT_DAILY_CHECK_TIME_ZONE = 'Asia/Seoul';
export const RESET_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ZonedDateParts {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

interface ResetParts {
	hour: number;
	minute: number;
}

interface ResetCandidate {
	utcMs: number;
	resetTime: string;
	dateKey: string;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
	const key = `en-US:${timeZone}`;
	const cached = formatterCache.get(key);
	if (cached) return cached;

	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	});
	formatterCache.set(key, formatter);
	return formatter;
}

function toEpochFromParts(parts: ZonedDateParts): number {
	return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function addDaysToCivilDate(year: number, month: number, day: number, days: number) {
	const date = new Date(Date.UTC(year, month - 1, day + days));
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate()
	};
}

function toDateKey(parts: Pick<ZonedDateParts, 'year' | 'month' | 'day'>): string {
	return [
		String(parts.year).padStart(4, '0'),
		String(parts.month).padStart(2, '0'),
		String(parts.day).padStart(2, '0')
	].join('-');
}

function parseZonedParts(date: Date, timeZone: string): ZonedDateParts {
	const formatter = getFormatter(timeZone);
	const parsed = {
		year: 0,
		month: 0,
		day: 0,
		hour: 0,
		minute: 0,
		second: 0
	};

	for (const part of formatter.formatToParts(date)) {
		if (part.type === 'year') parsed.year = Number(part.value);
		if (part.type === 'month') parsed.month = Number(part.value);
		if (part.type === 'day') parsed.day = Number(part.value);
		if (part.type === 'hour') parsed.hour = Number(part.value);
		if (part.type === 'minute') parsed.minute = Number(part.value);
		if (part.type === 'second') parsed.second = Number(part.value);
	}

	return parsed;
}

function zonedDateTimeToUtcMs(parts: ZonedDateParts, timeZone: string): number {
	let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
	for (let index = 0; index < 6; index += 1) {
		const observed = parseZonedParts(new Date(guess), timeZone);
		const diff = toEpochFromParts(parts) - toEpochFromParts(observed);
		if (Math.abs(diff) < 1000) break;
		guess += diff;
	}
	return guess;
}

function getSafeTimeZone(timeZone: string): string {
	return isValidTimeZone(timeZone) ? timeZone : DEFAULT_DAILY_CHECK_TIME_ZONE;
}

function parseReset(resetTime: string): ResetParts {
	const matched = resetTime.match(RESET_TIME_PATTERN);
	if (!matched) {
		return { hour: 0, minute: 0 };
	}
	return { hour: Number(matched[1]), minute: Number(matched[2]) };
}

function formatReset(reset: ResetParts): string {
	return `${String(reset.hour).padStart(2, '0')}:${String(reset.minute).padStart(2, '0')}`;
}

function isAfterOrEqualReset(local: ZonedDateParts, reset: ResetParts): boolean {
	if (local.hour > reset.hour) return true;
	if (local.hour < reset.hour) return false;
	return local.minute >= reset.minute;
}

export function isValidTimeZone(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
		return true;
	} catch {
		return false;
	}
}

export function isValidResetTime(resetTime: string): boolean {
	return RESET_TIME_PATTERN.test(resetTime);
}

export function normalizeResetTimes(resetTimes: string[]): string[] {
	const unique = new Set<string>();
	for (const raw of resetTimes) {
		const trimmed = raw.trim();
		if (!isValidResetTime(trimmed)) continue;
		unique.add(formatReset(parseReset(trimmed)));
	}

	const normalized = [...unique];
	normalized.sort((left, right) => {
		const leftReset = parseReset(left);
		const rightReset = parseReset(right);
		return leftReset.hour * 60 + leftReset.minute - (rightReset.hour * 60 + rightReset.minute);
	});
	return normalized;
}

function getSafeResetTimes(resetTimes: string[]): string[] {
	const normalized = normalizeResetTimes(resetTimes);
	return normalized.length > 0 ? normalized : ['00:00'];
}

function buildResetCandidates(now: Date, resetTimes: string[], timeZone: string): ResetCandidate[] {
	const safeZone = getSafeTimeZone(timeZone);
	const localNow = parseZonedParts(now, safeZone);
	const safeResetTimes = getSafeResetTimes(resetTimes);

	const candidates: ResetCandidate[] = [];
	for (const offset of [-1, 0, 1, 2]) {
		const date = addDaysToCivilDate(localNow.year, localNow.month, localNow.day, offset);
		const dateKey = toDateKey(date);
		for (const resetTime of safeResetTimes) {
			const reset = parseReset(resetTime);
			const utcMs = zonedDateTimeToUtcMs(
				{
					year: date.year,
					month: date.month,
					day: date.day,
					hour: reset.hour,
					minute: reset.minute,
					second: 0
				},
				safeZone
			);
			candidates.push({ utcMs, resetTime, dateKey });
		}
	}

	candidates.sort((left, right) => left.utcMs - right.utcMs);
	return candidates;
}

function getCurrentResetCandidate(now: Date, resetTimes: string[], timeZone: string): ResetCandidate {
	const candidates = buildResetCandidates(now, resetTimes, timeZone);
	const nowMs = now.getTime();
	let current = candidates[0];

	for (const candidate of candidates) {
		if (candidate.utcMs <= nowMs) {
			current = candidate;
		} else {
			break;
		}
	}
	return current;
}

export function getCurrentCycleKey(now: Date, resetTime: string, timeZone: string): string {
	return getCurrentCycleKeyByResetTimes(now, [resetTime], timeZone);
}

export function getCurrentCycleStartedAt(now: Date, resetTime: string, timeZone: string): number {
	return getCurrentCycleStartedAtByResetTimes(now, [resetTime], timeZone);
}

export function getCurrentCycleKeyByResetTimes(
	now: Date,
	resetTimes: string[],
	timeZone: string
): string {
	const current = getCurrentResetCandidate(now, resetTimes, timeZone);
	return `${current.dateKey}#${current.resetTime}`;
}

export function getCurrentCycleStartedAtByResetTimes(
	now: Date,
	resetTimes: string[],
	timeZone: string
): number {
	return getCurrentResetCandidate(now, resetTimes, timeZone).utcMs;
}

export function getCurrentActiveResetTime(
	now: Date,
	resetTimes: string[],
	timeZone: string
): string {
	return getCurrentResetCandidate(now, resetTimes, timeZone).resetTime;
}

export function getNextResetAtByResetTimes(now: Date, resetTimes: string[], timeZone: string): number {
	const candidates = buildResetCandidates(now, resetTimes, timeZone);
	const nowMs = now.getTime();
	const next = candidates.find((candidate) => candidate.utcMs > nowMs);
	if (next) return next.utcMs;
	return nowMs + DAY_MS;
}

export function getNextResetAt(now: Date, resetTime: string, timeZone: string): number {
	return getNextResetAtByResetTimes(now, [resetTime], timeZone);
}

export function buildDailyCheckItemView(item: DailyCheckItemRow, now: Date): DailyCheckItemView {
	const safeResetTimes = getSafeResetTimes(item.resetTimes);
	const currentCycleKey = getCurrentCycleKeyByResetTimes(now, safeResetTimes, item.timeZone);
	const currentCycleDateKey = currentCycleKey.split('#')[0];
	const activeResetTime = getCurrentActiveResetTime(now, safeResetTimes, item.timeZone);
	const cycleStartedAt = getCurrentCycleStartedAtByResetTimes(now, safeResetTimes, item.timeZone);
	const nextResetAt = getNextResetAtByResetTimes(now, safeResetTimes, item.timeZone);
	const minutesPastReset = Math.max(0, Math.floor((now.getTime() - cycleStartedAt) / 60000));
	const minutesUntilReset = Math.max(0, Math.ceil((nextResetAt - now.getTime()) / 60000));
	const isCompleted =
		item.completionCycleKey === currentCycleKey || item.completionCycleKey === currentCycleDateKey;

	return {
		...item,
		resetTimes: safeResetTimes,
		currentCycleKey,
		activeResetTime,
		isCompleted,
		cycleStartedAt,
		minutesPastReset,
		minutesUntilReset,
		nextResetAt
	};
}

export function summarizeRemainingMinutes(items: DailyCheckItemView[]): number {
	return items.reduce((sum, item) => {
		if (item.isCompleted) return sum;
		return sum + (item.estimatedMinutes ?? 0);
	}, 0);
}

export function getReminderToastKey(itemCount: number, cycleKeys: string[]): string {
	const sorted = [...cycleKeys].sort();
	return `${itemCount}:${sorted.join('|')}`;
}

export function getFallbackCycleWindowMs(): number {
	return DAY_MS;
}
