export interface DailyCheckItemRow {
	id: number;
	title: string;
	kind: string;
	importance: string;
	url: string;
	notes: string | null;
	estimatedMinutes: number | null;
	resetTimes: string[];
	timeZone: string;
	completionCycleKey: string | null;
	completedAt: number | null;
	createdAt: number;
	updatedAt: number;
}

export interface DailyCheckItemView extends DailyCheckItemRow {
	currentCycleKey: string;
	activeResetTime: string;
	isCompleted: boolean;
	cycleStartedAt: number;
	minutesPastReset: number;
	minutesUntilReset: number;
	nextResetAt: number;
}

export interface DailyCheckFormInput {
	title: string;
	kind: string;
	importance: string;
	url: string;
	notes: string | null;
	estimatedMinutes: number | null;
	resetTimes: string[];
	timeZone: string;
}

export interface DailyReminderItem {
	id: number;
	title: string;
	kind: string;
	importance: string;
	url: string;
	estimatedMinutes: number | null;
	activeResetTime: string;
	resetTimes: string[];
	timeZone: string;
	cycleKey: string;
}

export interface DailyReminder {
	generatedAt: number;
	itemCount: number;
	totalEstimatedMinutes: number;
	cycleKeys: string[];
	items: DailyReminderItem[];
}

export interface PushSubscriptionRow {
	id: number;
	endpoint: string;
	p256dh: string;
	auth: string;
	userAgent: string | null;
	lastSuccessAt: number | null;
	lastError: string | null;
	createdAt: number;
	updatedAt: number;
}

export interface DispatchResult {
	success: boolean;
	dispatched: number;
	skipped: number;
	invalidSubscriptions: number;
	errors: string[];
	cycleKeys: string[];
}
