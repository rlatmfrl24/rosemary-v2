import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, POST } from './+server';
import {
	removePushSubscriptionByEndpoint,
	upsertPushSubscription
} from '$lib/server/daily-check/database';

vi.mock('$lib/server/daily-check/infrastructure', () => ({
	ensureDailyCheckInfrastructure: vi.fn()
}));

vi.mock('$lib/server/daily-check/database', () => ({
	upsertPushSubscription: vi.fn(),
	removePushSubscriptionByEndpoint: vi.fn()
}));

function buildPlatform() {
	return {
		env: {
			DB: {} as D1Database
		}
	} as App.Platform;
}

describe('daily-check push-subscriptions API', () => {
	beforeEach(() => {
		vi.mocked(upsertPushSubscription).mockReset();
		vi.mocked(removePushSubscriptionByEndpoint).mockReset();
	});

	it('rejects invalid subscription payload', async () => {
		const request = new Request('http://localhost/api/daily-check/push-subscriptions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				subscription: {
					endpoint: 'https://example.com/push',
					keys: { p256dh: 'short', auth: 'short' }
				}
			})
		});

		const response = await POST({ platform: buildPlatform(), request } as never);
		expect(response.status).toBe(400);
	});

	it('accepts valid subscription payload', async () => {
		vi.mocked(upsertPushSubscription).mockResolvedValue({
			id: 1,
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
			p256dh: 'A'.repeat(88),
			auth: 'B'.repeat(16),
			userAgent: 'test-agent',
			lastSuccessAt: null,
			lastError: null,
			createdAt: 1,
			updatedAt: 1
		});

		const request = new Request('http://localhost/api/daily-check/push-subscriptions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				subscription: {
					endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
					keys: { p256dh: 'A'.repeat(88), auth: 'B'.repeat(16) }
				},
				userAgent: 'test-agent'
			})
		});

		const response = await POST({ platform: buildPlatform(), request } as never);
		const body = (await response.json()) as { success: boolean };

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(upsertPushSubscription).toHaveBeenCalledOnce();
	});

	it('rejects invalid endpoint on delete', async () => {
		const request = new Request('http://localhost/api/daily-check/push-subscriptions', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ endpoint: 'not-valid-endpoint' })
		});

		const response = await DELETE({ platform: buildPlatform(), request } as never);
		expect(response.status).toBe(400);
	});

	it('deletes valid endpoint', async () => {
		vi.mocked(removePushSubscriptionByEndpoint).mockResolvedValue(true);
		const endpoint = 'https://fcm.googleapis.com/fcm/send/delete-target';
		const request = new Request('http://localhost/api/daily-check/push-subscriptions', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ endpoint })
		});

		const response = await DELETE({ platform: buildPlatform(), request } as never);
		const body = (await response.json()) as { success: boolean; removed: boolean };

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.removed).toBe(true);
		expect(removePushSubscriptionByEndpoint).toHaveBeenCalledWith(expect.anything(), endpoint);
	});
});
