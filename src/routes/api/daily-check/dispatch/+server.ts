import type { DispatchResult } from '$lib/daily-check/types';
import {
	getPushSubscriptions,
	getReminderDispatchCandidates,
	markPushSubscriptionError,
	markPushSubscriptionSuccesses,
	recordReminderDispatchLogs,
	removePushSubscriptionsByEndpoints
} from '$lib/server/daily-check/database';
import { ensureDailyCheckInfrastructure } from '$lib/server/daily-check/infrastructure';
import { isExpiredSubscriptionStatus, sendWebPushNotification } from '$lib/server/daily-check/web-push';
import { json, type RequestHandler } from '@sveltejs/kit';

function getDb(platform: App.Platform | undefined): D1Database | null {
	return platform?.env?.DB ?? null;
}

function unauthorizedResponse() {
	return json(
		{
			success: false,
			error: 'Unauthorized'
		},
		{
			status: 401,
			headers: { 'Cache-Control': 'no-store' }
		}
	);
}

function extractBearerToken(authorizationHeader: string | null): string | null {
	if (!authorizationHeader?.startsWith('Bearer ')) return null;
	return authorizationHeader.slice('Bearer '.length).trim();
}

export const POST: RequestHandler = async ({ platform, request }) => {
	const db = getDb(platform);
	if (!db) {
		return json(
			{
				success: false,
				error: '데이터베이스가 연결되지 않았습니다.'
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const expectedToken = platform?.env?.DAILY_CHECK_CRON_TOKEN;
	if (!expectedToken) {
		return json(
			{
				success: false,
				error: 'DAILY_CHECK_CRON_TOKEN 이 설정되지 않았습니다.'
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const token = extractBearerToken(request.headers.get('Authorization'));
	if (!token || token !== expectedToken) {
		return unauthorizedResponse();
	}

	await ensureDailyCheckInfrastructure(db);
	const candidates = await getReminderDispatchCandidates(db);
	if (candidates.length === 0) {
		const emptyResult: DispatchResult = {
			success: true,
			dispatched: 0,
			skipped: 0,
			invalidSubscriptions: 0,
			errors: [],
			cycleKeys: []
		};
		return json(emptyResult, { headers: { 'Cache-Control': 'no-store' } });
	}

	const subscriptions = await getPushSubscriptions(db);
	if (subscriptions.length === 0) {
		const result: DispatchResult = {
			success: true,
			dispatched: 0,
			skipped: candidates.length,
			invalidSubscriptions: 0,
			errors: [],
			cycleKeys: [...new Set(candidates.map((candidate) => candidate.cycleKey))]
		};
		return json(result, { headers: { 'Cache-Control': 'no-store' } });
	}

	const vapidPublicKey = platform?.env?.VAPID_PUBLIC_KEY;
	const vapidPrivateKey = platform?.env?.VAPID_PRIVATE_KEY;
	const subject = platform?.env?.WEB_PUSH_SUBJECT ?? 'mailto:daily-check@example.com';

	if (!vapidPublicKey || !vapidPrivateKey) {
		return json(
			{
				success: false,
				error: 'VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 가 설정되지 않았습니다.'
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const successEndpoints: string[] = [];
	const invalidEndpoints: string[] = [];
	const errors: string[] = [];

	for (const subscription of subscriptions) {
		const result = await sendWebPushNotification(
			{
				endpoint: subscription.endpoint,
				p256dh: subscription.p256dh,
				auth: subscription.auth
			},
			{
				vapidPublicKey,
				vapidPrivateKey,
				subject
			}
		);

		if (result.ok) {
			successEndpoints.push(subscription.endpoint);
			continue;
		}

		const errorMessage = result.error ?? `Web push failed: status=${result.status}`;
		errors.push(`[${subscription.endpoint}] ${errorMessage}`);
		await markPushSubscriptionError(db, subscription.endpoint, errorMessage);

		if (isExpiredSubscriptionStatus(result.status)) {
			invalidEndpoints.push(subscription.endpoint);
		}
	}

	if (invalidEndpoints.length > 0) {
		await removePushSubscriptionsByEndpoints(db, invalidEndpoints);
	}

	if (successEndpoints.length > 0) {
		await markPushSubscriptionSuccesses(db, successEndpoints);
		await recordReminderDispatchLogs(db, candidates);
	}

	const response: DispatchResult = {
		success: true,
		dispatched: successEndpoints.length,
		skipped: subscriptions.length - successEndpoints.length,
		invalidSubscriptions: invalidEndpoints.length,
		errors,
		cycleKeys: [...new Set(candidates.map((candidate) => candidate.cycleKey))]
	};

	return json(response, {
		headers: { 'Cache-Control': 'no-store' }
	});
};
