import {
	DEFAULT_DAILY_CHECK_TIME_ZONE,
	normalizeResetTimes,
	isValidTimeZone
} from '$lib/daily-check/time';
import {
	DAILY_CHECK_KIND_OPTIONS,
	DAILY_CHECK_IMPORTANCE_OPTIONS,
	DEFAULT_DAILY_CHECK_IMPORTANCE
} from '$lib/daily-check/constants';
import type { DailyCheckFormInput } from '$lib/daily-check/types';

export interface ValidationResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

function getTextValue(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value.trim() : '';
}

function parseEstimatedMinutes(raw: string): number | null {
	if (!raw) return null;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return Number.NaN;
	return Math.floor(parsed);
}

function validateUrl(rawUrl: string): boolean {
	try {
		const parsed = new URL(rawUrl);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

const ALLOWED_KIND_VALUES: ReadonlySet<string> = new Set(
	DAILY_CHECK_KIND_OPTIONS.map((option) => option.value)
);
const ALLOWED_IMPORTANCE_VALUES: ReadonlySet<string> = new Set(
	DAILY_CHECK_IMPORTANCE_OPTIONS.map((option) => option.value)
);

export function parseDailyCheckFormInput(formData: FormData): ValidationResult<DailyCheckFormInput> {
	const title = getTextValue(formData, 'title');
	const kind = getTextValue(formData, 'kind');
	const importanceRaw = getTextValue(formData, 'importance');
	const importance = importanceRaw || DEFAULT_DAILY_CHECK_IMPORTANCE;
	const url = getTextValue(formData, 'url');
	const notes = getTextValue(formData, 'notes');
	const estimatedMinutesRaw = getTextValue(formData, 'estimatedMinutes');
	const resetTimeValues = formData
		.getAll('resetTimes')
		.filter((value): value is string => typeof value === 'string')
		.map((value) => value.trim())
		.filter(Boolean);
	const timeZoneRaw = getTextValue(formData, 'timeZone');
	const timeZone = timeZoneRaw || DEFAULT_DAILY_CHECK_TIME_ZONE;

	if (!title) {
		return { success: false, error: '출석 항목 제목은 필수입니다.' };
	}
	if (title.length > 120) {
		return { success: false, error: '출석 항목 제목은 120자 이하여야 합니다.' };
	}

	if (!kind) {
		return { success: false, error: '항목 유형은 필수입니다.' };
	}
	if (!ALLOWED_KIND_VALUES.has(kind)) {
		return { success: false, error: '항목 유형은 지정된 선택값 중 하나여야 합니다.' };
	}
	if (!ALLOWED_IMPORTANCE_VALUES.has(importance)) {
		return { success: false, error: '중요도는 지정된 선택값 중 하나여야 합니다.' };
	}

	const requiresSiteUrl = kind === 'site_visit';
	if (requiresSiteUrl && !url) {
		return { success: false, error: '사이트 링크는 필수입니다.' };
	}
	if (url && !validateUrl(url)) {
		return { success: false, error: '사이트 링크는 http(s) URL 이어야 합니다.' };
	}

	if (notes.length > 1000) {
		return { success: false, error: '메모는 1000자 이하여야 합니다.' };
	}

	const estimatedMinutes = parseEstimatedMinutes(estimatedMinutesRaw);
	if (Number.isNaN(estimatedMinutes)) {
		return { success: false, error: '예상 소요시간은 숫자로 입력해야 합니다.' };
	}
	if (estimatedMinutes !== null && (estimatedMinutes < 1 || estimatedMinutes > 1440)) {
		return { success: false, error: '예상 소요시간은 1~1440분 사이여야 합니다.' };
	}

	if (resetTimeValues.length === 0) {
		return { success: false, error: '리셋 시간은 최소 1개 이상 필요합니다.' };
	}
	if (resetTimeValues.length > 24) {
		return { success: false, error: '리셋 시간은 최대 24개까지 등록할 수 있습니다.' };
	}
	const normalizedResetTimes = normalizeResetTimes(resetTimeValues);
	if (normalizedResetTimes.length !== resetTimeValues.length) {
		return { success: false, error: '리셋 시간은 HH:mm 형식이어야 하며 중복될 수 없습니다.' };
	}

	if (!isValidTimeZone(timeZone)) {
		return { success: false, error: '유효한 IANA 타임존을 입력해 주세요.' };
	}

	return {
		success: true,
		data: {
			title,
			kind,
			importance,
			url,
			notes: notes || null,
			estimatedMinutes,
			resetTimes: normalizedResetTimes,
			timeZone
		}
	};
}
