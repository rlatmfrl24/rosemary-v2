export const COMMON_TIME_ZONES = [
	'Asia/Seoul',
	'Asia/Tokyo',
	'Asia/Singapore',
	'UTC',
	'America/Los_Angeles',
	'America/New_York',
	'Europe/London'
] as const;

export const DAILY_CHECK_KIND_OPTIONS = [
	{ value: 'site_visit', label: '사이트 출석/접속' },
	{ value: 'mission', label: '임무 수행' },
	{ value: 'daily_quest', label: '게임 일일퀘스트' }
] as const;

export const DAILY_CHECK_IMPORTANCE_OPTIONS = [
	{ value: 'low', label: '낮음' },
	{ value: 'normal', label: '보통' },
	{ value: 'high', label: '높음' },
	{ value: 'critical', label: '매우 높음' }
] as const;

export const DEFAULT_DAILY_CHECK_IMPORTANCE = 'normal';
