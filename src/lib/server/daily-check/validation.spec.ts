import { describe, expect, it } from 'vitest';
import { parseDailyCheckFormInput } from './validation';

function buildValidFormData(): FormData {
	const formData = new FormData();
	formData.set('title', '아침 출석');
	formData.set('kind', 'daily_quest');
	formData.set('importance', 'normal');
	formData.set('url', 'https://example.com/check');
	formData.set('notes', '테스트 메모');
	formData.set('estimatedMinutes', '15');
	formData.append('resetTimes', '09:00');
	formData.set('timeZone', 'Asia/Seoul');
	return formData;
}

describe('daily-check form validation', () => {
	it('parses valid form input', () => {
		const result = parseDailyCheckFormInput(buildValidFormData());
		expect(result.success).toBe(true);
		expect(result.data?.title).toBe('아침 출석');
		expect(result.data?.estimatedMinutes).toBe(15);
		expect(result.data?.importance).toBe('normal');
		expect(result.data?.resetTimes).toEqual(['09:00']);
	});

	it('fails when required fields are missing', () => {
		const formData = buildValidFormData();
		formData.set('title', '');
		const result = parseDailyCheckFormInput(formData);
		expect(result.success).toBe(false);
		expect(result.error).toContain('제목');
	});

	it('fails for invalid url and timezone', () => {
		const formData = buildValidFormData();
		formData.set('url', 'not-url');
		formData.set('timeZone', 'Wrong/Timezone');
		const result = parseDailyCheckFormInput(formData);
		expect(result.success).toBe(false);
		expect(result.error).toContain('URL');
	});

	it('requires url only for site_visit kind', () => {
		const missionFormData = buildValidFormData();
		missionFormData.set('kind', 'mission');
		missionFormData.set('url', '');
		const missionResult = parseDailyCheckFormInput(missionFormData);
		expect(missionResult.success).toBe(true);

		const siteVisitFormData = buildValidFormData();
		siteVisitFormData.set('kind', 'site_visit');
		siteVisitFormData.set('url', '');
		const siteVisitResult = parseDailyCheckFormInput(siteVisitFormData);
		expect(siteVisitResult.success).toBe(false);
		expect(siteVisitResult.error).toContain('필수');
	});

	it('accepts multiple reset times and rejects duplicates', () => {
		const validFormData = buildValidFormData();
		validFormData.append('resetTimes', '18:30');
		const validResult = parseDailyCheckFormInput(validFormData);
		expect(validResult.success).toBe(true);
		expect(validResult.data?.resetTimes).toEqual(['09:00', '18:30']);

		const invalidFormData = buildValidFormData();
		invalidFormData.append('resetTimes', '09:00');
		const invalidResult = parseDailyCheckFormInput(invalidFormData);
		expect(invalidResult.success).toBe(false);
		expect(invalidResult.error).toContain('중복');
	});

	it('allows empty estimated minutes', () => {
		const formData = buildValidFormData();
		formData.set('estimatedMinutes', '');
		const result = parseDailyCheckFormInput(formData);
		expect(result.success).toBe(true);
		expect(result.data?.estimatedMinutes).toBeNull();
	});
});
