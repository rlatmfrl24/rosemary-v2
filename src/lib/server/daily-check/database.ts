import type {
	DailyCheckFormInput,
	DailyCheckItemRow,
	DailyCheckItemView,
	DailyReminder
} from '$lib/daily-check/types';
import { buildDailyCheckItemView, normalizeResetTimes } from '$lib/daily-check/time';
import { DEFAULT_DAILY_CHECK_IMPORTANCE } from '$lib/daily-check/constants';
import { daily_check_items } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { ensureDailyCheckInfrastructure } from './infrastructure';

type DailyCheckItemDbRow = typeof daily_check_items.$inferSelect;

export function createDatabase(db: D1Database) {
	return drizzle(db);
}

function parseResetTimes(rawResetTimes: string | null | undefined, fallbackResetTime: string): string[] {
	let parsed: string[] = [];
	if (rawResetTimes) {
		try {
			const decoded = JSON.parse(rawResetTimes) as unknown;
			if (Array.isArray(decoded)) {
				parsed = decoded.filter((value): value is string => typeof value === 'string');
			}
		} catch {
			parsed = [];
		}
	}

	if (parsed.length === 0 && fallbackResetTime) {
		parsed = [fallbackResetTime];
	}
	const normalized = normalizeResetTimes(parsed);
	return normalized.length > 0 ? normalized : ['00:00'];
}

function toDailyCheckItemRow(row: DailyCheckItemDbRow): DailyCheckItemRow {
	return {
		id: row.id,
		title: row.title,
		kind: row.kind,
		importance: row.importance ?? DEFAULT_DAILY_CHECK_IMPORTANCE,
		url: row.url ?? '',
		notes: row.notes ?? null,
		estimatedMinutes: row.estimatedMinutes ?? null,
		resetTimes: parseResetTimes(row.resetTimes, row.resetTime),
		timeZone: row.timeZone,
		completionCycleKey: row.completionCycleKey ?? null,
		completedAt: row.completedAt ?? null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

async function getDailyCheckItemById(db: D1Database, id: number): Promise<DailyCheckItemRow | null> {
	const database = createDatabase(db);
	const [item] = await database.select().from(daily_check_items).where(eq(daily_check_items.id, id)).limit(1);
	return item ? toDailyCheckItemRow(item) : null;
}

export async function getDailyCheckItems(db: D1Database): Promise<DailyCheckItemRow[]> {
	await ensureDailyCheckInfrastructure(db);
	const database = createDatabase(db);
	const rows = await database
		.select()
		.from(daily_check_items)
		.orderBy(desc(daily_check_items.createdAt), desc(daily_check_items.id));
	return rows.map((row) => toDailyCheckItemRow(row));
}

export async function createDailyCheckItem(
	db: D1Database,
	input: DailyCheckFormInput
): Promise<DailyCheckItemRow | null> {
	await ensureDailyCheckInfrastructure(db);
	const database = createDatabase(db);
	const now = Math.floor(Date.now() / 1000);
	const normalizedResetTimes = normalizeResetTimes(input.resetTimes);
	const primaryResetTime = normalizedResetTimes[0] ?? '00:00';
	const [created] = await database
		.insert(daily_check_items)
		.values({
			title: input.title,
			kind: input.kind,
			importance: input.importance,
			url: input.url,
			notes: input.notes,
			estimatedMinutes: input.estimatedMinutes,
			resetTimes: JSON.stringify(normalizedResetTimes),
			resetTime: primaryResetTime,
			timeZone: input.timeZone,
			completionCycleKey: null,
			completedAt: null,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	return created ? toDailyCheckItemRow(created) : null;
}

export async function updateDailyCheckItem(
	db: D1Database,
	id: number,
	input: DailyCheckFormInput
): Promise<boolean> {
	await ensureDailyCheckInfrastructure(db);
	const existing = await getDailyCheckItemById(db, id);
	if (!existing) return false;

	const normalizedResetTimes = normalizeResetTimes(input.resetTimes);
	const primaryResetTime = normalizedResetTimes[0] ?? '00:00';
	const database = createDatabase(db);
	await database
		.update(daily_check_items)
		.set({
			title: input.title,
			kind: input.kind,
			importance: input.importance,
			url: input.url,
			notes: input.notes,
			estimatedMinutes: input.estimatedMinutes,
			resetTimes: JSON.stringify(normalizedResetTimes),
			resetTime: primaryResetTime,
			timeZone: input.timeZone,
			updatedAt: Math.floor(Date.now() / 1000)
		})
		.where(eq(daily_check_items.id, id));

	return true;
}

export async function deleteDailyCheckItem(db: D1Database, id: number): Promise<boolean> {
	await ensureDailyCheckInfrastructure(db);
	const existing = await getDailyCheckItemById(db, id);
	if (!existing) return false;

	const database = createDatabase(db);
	await database.delete(daily_check_items).where(eq(daily_check_items.id, id));
	return true;
}

export async function setDailyCheckItemCompletion(
	db: D1Database,
	id: number,
	completed: boolean,
	now: Date = new Date()
): Promise<boolean> {
	await ensureDailyCheckInfrastructure(db);
	const item = await getDailyCheckItemById(db, id);
	if (!item) return false;

	const view = buildDailyCheckItemView(item, now);
	const database = createDatabase(db);
	await database
		.update(daily_check_items)
		.set({
			completionCycleKey: completed ? view.currentCycleKey : null,
			completedAt: completed ? Math.floor(now.getTime() / 1000) : null,
			updatedAt: Math.floor(now.getTime() / 1000)
		})
		.where(eq(daily_check_items.id, id));
	return true;
}

export async function getDailyReminder(db: D1Database, now: Date = new Date()): Promise<DailyReminder | null> {
	const rows = await getDailyCheckItems(db);
	const dueItems = rows.map((item) => buildDailyCheckItemView(item, now)).filter((item) => !item.isCompleted);
	if (dueItems.length === 0) return null;

	const cycleKeys = [...new Set(dueItems.map((item) => item.currentCycleKey))];
	const totalEstimatedMinutes = dueItems.reduce(
		(sum, item) => sum + (item.estimatedMinutes === null ? 0 : item.estimatedMinutes),
		0
	);

	return {
		generatedAt: now.getTime(),
		itemCount: dueItems.length,
		totalEstimatedMinutes,
		cycleKeys,
		items: dueItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			importance: item.importance,
			url: item.url,
			estimatedMinutes: item.estimatedMinutes,
			activeResetTime: item.activeResetTime,
			resetTimes: item.resetTimes,
			timeZone: item.timeZone,
			cycleKey: item.currentCycleKey
		}))
	};
}
