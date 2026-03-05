import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './+server';
import {
	getPushSubscriptions,
	getReminderDispatchCandidates,
	markPushSubscriptionError,
	markPushSubscriptionSuccesses,
	recordReminderDispatchLogs,
	removePushSubscriptionsByEndpoints
} from '$lib/server/daily-check/database';
import { sendWebPushNotification } from '$lib/server/daily-check/web-push';

vi.mock('$lib/server/daily-check/infrastructure', () => ({
	ensureDailyCheckInfrastructure: vi.fn()
}));

vi.mock('$lib/server/daily-check/database', () => ({
	getPushSubscriptions: vi.fn(),
	getReminderDispatchCandidates: vi.fn(),
	markPushSubscriptionError: vi.fn(),
	markPushSubscriptionSuccesses: vi.fn(),
	recordReminderDispatchLogs: vi.fn(),
	removePushSubscriptionsByEndpoints: vi.fn()
}));

vi.mock('$lib/server/daily-check/web-push', () => ({
	sendWebPushNotification: vi.fn(),
	isExpiredSubscriptionStatus: (status: number) => status === 404 || status === 410
}));

function buildRequest(headers?: HeadersInit): Request {
	return new Request('https://example.com/api/daily-check/dispatch', {
		method: 'POST',
		headers
	});
}

function buildPlatform(overrides?: Partial<App.Platform['env']>) {
	return {
		env: {
			DB: {} as D1Database,
			DAILY_CHECK_CRON_TOKEN: 'secret-token',
			VAPID_PUBLIC_KEY: 'public',
			VAPID_PRIVATE_KEY: 'private',
			WEB_PUSH_SUBJECT: 'mailto:test@example.com',
			...overrides
		}
	} as App.Platform;
}

describe('daily-check dispatch API', () => {
	beforeEach(() => {
		vi.mocked(getPushSubscriptions).mockReset();
		vi.mocked(getReminderDispatchCandidates).mockReset();
		vi.mocked(markPushSubscriptionError).mockReset();
		vi.mocked(markPushSubscriptionSuccesses).mockReset();
		vi.mocked(recordReminderDispatchLogs).mockReset();
		vi.mocked(removePushSubscriptionsByEndpoints).mockReset();
		vi.mocked(sendWebPushNotification).mockReset();
	});

	it('returns 401 when token is missing', async () => {
		const response = await POST({
			platform: buildPlatform(),
			request: buildRequest()
		} as never);

		expect(response.status).toBe(401);
	});

	it('returns success with zero candidate/subscription counts', async () => {
		vi.mocked(getReminderDispatchCandidates).mockResolvedValue([]);
		vi.mocked(getPushSubscriptions).mockResolvedValue([]);

		const response = await POST({
			platform: buildPlatform(),
			request: buildRequest({ Authorization: 'Bearer secret-token' })
		} as never);
		const body = (await response.json()) as {
			success: boolean;
			candidateItems: number;
			subscriptionCount: number;
		};

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.candidateItems).toBe(0);
		expect(body.subscriptionCount).toBe(0);
	});

	it('handles mixed push results and removes expired subscriptions', async () => {
		const candidates = [
			{
				item: {
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
					pushReminderOffsetMinutes: 15,
					completionCycleKey: null,
					completedAt: null,
					createdAt: 0,
					updatedAt: 0,
					currentCycleKey: '2026-03-05#09:00',
					activeResetTime: '09:00',
					isCompleted: false,
					cycleStartedAt: 0,
					minutesPastReset: 0,
					minutesUntilReset: 0,
					nextResetAt: 0
				},
				cycleKey: '2026-03-05#09:00',
				effectiveOffsetMinutes: 15,
				dueAt: 0
			}
		];

		vi.mocked(getReminderDispatchCandidates).mockResolvedValue(candidates);
		vi.mocked(getPushSubscriptions).mockResolvedValue([
			{
				id: 1,
				endpoint: 'https://fcm.googleapis.com/fcm/send/success',
				p256dh: 'A'.repeat(88),
				auth: 'B'.repeat(16),
				userAgent: null,
				lastSuccessAt: null,
				lastError: null,
				createdAt: 0,
				updatedAt: 0
			},
			{
				id: 2,
				endpoint: 'https://fcm.googleapis.com/fcm/send/expired',
				p256dh: 'A'.repeat(88),
				auth: 'B'.repeat(16),
				userAgent: null,
				lastSuccessAt: null,
				lastError: null,
				createdAt: 0,
				updatedAt: 0
			},
			{
				id: 3,
				endpoint: 'https://fcm.googleapis.com/fcm/send/failure',
				p256dh: 'A'.repeat(88),
				auth: 'B'.repeat(16),
				userAgent: null,
				lastSuccessAt: null,
				lastError: null,
				createdAt: 0,
				updatedAt: 0
			}
		]);
		vi.mocked(sendWebPushNotification)
			.mockResolvedValueOnce({ ok: true, status: 201 })
			.mockResolvedValueOnce({ ok: false, status: 404, error: 'expired' })
			.mockResolvedValueOnce({ ok: false, status: 500, error: 'internal error' });

		const response = await POST({
			platform: buildPlatform(),
			request: buildRequest({ Authorization: 'Bearer secret-token' })
		} as never);
		const body = (await response.json()) as {
			success: boolean;
			candidateItems: number;
			subscriptionCount: number;
			dispatched: number;
			failed: number;
			invalidSubscriptions: number;
		};

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.candidateItems).toBe(1);
		expect(body.subscriptionCount).toBe(3);
		expect(body.dispatched).toBe(1);
		expect(body.failed).toBe(2);
		expect(body.invalidSubscriptions).toBe(1);

		expect(removePushSubscriptionsByEndpoints).toHaveBeenCalledWith(expect.anything(), [
			'https://fcm.googleapis.com/fcm/send/expired'
		]);
		expect(markPushSubscriptionSuccesses).toHaveBeenCalledTimes(1);
		expect(recordReminderDispatchLogs).toHaveBeenCalledWith(expect.anything(), candidates);
		expect(markPushSubscriptionError).toHaveBeenCalledTimes(2);
	});
});
