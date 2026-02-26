import {
	COMMON_TIME_ZONES,
	DAILY_CHECK_IMPORTANCE_OPTIONS,
	DAILY_CHECK_KIND_OPTIONS,
	DEFAULT_DAILY_CHECK_IMPORTANCE
} from '$lib/daily-check/constants';
import { DEFAULT_DAILY_CHECK_TIME_ZONE } from '$lib/daily-check/time';
import {
	createDailyCheckItem,
	deleteDailyCheckItem,
	getDailyCheckItems,
	setDailyCheckItemCompletion,
	updateDailyCheckItem
} from '$lib/server/daily-check/database';
import { ensureDailyCheckInfrastructure } from '$lib/server/daily-check/infrastructure';
import { parseDailyCheckFormInput } from '$lib/server/daily-check/validation';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function getDb(platform: App.Platform | undefined): D1Database | null {
	return platform?.env?.DB ?? null;
}

function parseId(formData: FormData): number | null {
	const raw = formData.get('id');
	if (typeof raw !== 'string') return null;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed) || parsed < 1) return null;
	return Math.floor(parsed);
}

function parseBooleanField(formData: FormData, key: string): boolean | null {
	const raw = formData.get(key);
	if (typeof raw !== 'string') return null;
	if (raw === 'true') return true;
	if (raw === 'false') return false;
	return null;
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	if (!db) {
		return {
			items: [],
			serverNow: Date.now(),
			commonTimeZones: COMMON_TIME_ZONES,
			kindOptions: DAILY_CHECK_KIND_OPTIONS,
			importanceOptions: DAILY_CHECK_IMPORTANCE_OPTIONS,
			defaultTimeZone: DEFAULT_DAILY_CHECK_TIME_ZONE,
			defaultImportance: DEFAULT_DAILY_CHECK_IMPORTANCE,
			vapidPublicKey: null,
			dbUnavailable: true
		};
	}

	await ensureDailyCheckInfrastructure(db);
	const items = await getDailyCheckItems(db);
	return {
		items,
		serverNow: Date.now(),
		commonTimeZones: COMMON_TIME_ZONES,
		kindOptions: DAILY_CHECK_KIND_OPTIONS,
		importanceOptions: DAILY_CHECK_IMPORTANCE_OPTIONS,
		defaultTimeZone: DEFAULT_DAILY_CHECK_TIME_ZONE,
		defaultImportance: DEFAULT_DAILY_CHECK_IMPORTANCE,
		vapidPublicKey: platform?.env?.VAPID_PUBLIC_KEY ?? null,
		dbUnavailable: false
	};
};

export const actions: Actions = {
	createItem: async ({ request, platform }) => {
		const db = getDb(platform);
		if (!db) {
			return fail(500, { success: false, error: '데이터베이스 연결이 필요합니다.' });
		}

		const formData = await request.formData();
		const parsed = parseDailyCheckFormInput(formData);
		if (!parsed.success || !parsed.data) {
			return fail(400, { success: false, error: parsed.error ?? '입력값을 확인해 주세요.' });
		}

		const created = await createDailyCheckItem(db, parsed.data);
		if (!created) {
			return fail(500, { success: false, error: '출석 항목 생성에 실패했습니다.' });
		}

		return {
			success: true,
			message: '출석 항목을 추가했습니다.'
		};
	},
	updateItem: async ({ request, platform }) => {
		const db = getDb(platform);
		if (!db) {
			return fail(500, { success: false, error: '데이터베이스 연결이 필요합니다.' });
		}

		const formData = await request.formData();
		const id = parseId(formData);
		if (!id) {
			return fail(400, { success: false, error: '수정 대상 항목 ID가 올바르지 않습니다.' });
		}

		const parsed = parseDailyCheckFormInput(formData);
		if (!parsed.success || !parsed.data) {
			return fail(400, { success: false, error: parsed.error ?? '입력값을 확인해 주세요.' });
		}

		const updated = await updateDailyCheckItem(db, id, parsed.data);
		if (!updated) {
			return fail(404, { success: false, error: '수정할 항목을 찾지 못했습니다.' });
		}

		return {
			success: true,
			message: '출석 항목을 수정했습니다.'
		};
	},
	deleteItem: async ({ request, platform }) => {
		const db = getDb(platform);
		if (!db) {
			return fail(500, { success: false, error: '데이터베이스 연결이 필요합니다.' });
		}

		const formData = await request.formData();
		const id = parseId(formData);
		if (!id) {
			return fail(400, { success: false, error: '삭제 대상 항목 ID가 올바르지 않습니다.' });
		}

		const deleted = await deleteDailyCheckItem(db, id);
		if (!deleted) {
			return fail(404, { success: false, error: '삭제할 항목을 찾지 못했습니다.' });
		}

		return {
			success: true,
			message: '출석 항목을 삭제했습니다.'
		};
	},
	toggleItemCompletion: async ({ request, platform }) => {
		const db = getDb(platform);
		if (!db) {
			return fail(500, { success: false, error: '데이터베이스 연결이 필요합니다.' });
		}

		const formData = await request.formData();
		const id = parseId(formData);
		const completed = parseBooleanField(formData, 'completed');
		if (!id || completed === null) {
			return fail(400, { success: false, error: '완료 상태 변경 파라미터가 올바르지 않습니다.' });
		}

		const updated = await setDailyCheckItemCompletion(db, id, completed);
		if (!updated) {
			return fail(404, { success: false, error: '완료 상태를 변경할 항목을 찾지 못했습니다.' });
		}

		return {
			success: true,
			message: completed ? '출석 체크 완료로 표시했습니다.' : '출석 체크 완료를 해제했습니다.'
		};
	}
};
