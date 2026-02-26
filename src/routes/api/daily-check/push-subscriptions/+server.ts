import {
	removePushSubscriptionByEndpoint,
	upsertPushSubscription
} from '$lib/server/daily-check/database';
import { ensureDailyCheckInfrastructure } from '$lib/server/daily-check/infrastructure';
import { json, type RequestHandler } from '@sveltejs/kit';

interface PushSubscriptionPayload {
	subscription?: {
		endpoint?: string;
		keys?: {
			p256dh?: string;
			auth?: string;
		};
	};
	endpoint?: string;
	userAgent?: string;
}

function getDb(platform: App.Platform | undefined): D1Database | null {
	return platform?.env?.DB ?? null;
}

function parseSubscriptionInput(payload: PushSubscriptionPayload) {
	const subscription = payload.subscription;
	const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint.trim() : '';
	const p256dh =
		typeof subscription?.keys?.p256dh === 'string' ? subscription.keys.p256dh.trim() : '';
	const auth = typeof subscription?.keys?.auth === 'string' ? subscription.keys.auth.trim() : '';
	const userAgent = typeof payload.userAgent === 'string' ? payload.userAgent.trim() : null;

	if (!endpoint || !p256dh || !auth) {
		return null;
	}

	return {
		endpoint,
		p256dh,
		auth,
		userAgent
	};
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

	const payload = (await request.json().catch(() => null)) as PushSubscriptionPayload | null;
	if (!payload) {
		return json(
			{
				success: false,
				error: '요청 본문(JSON)이 올바르지 않습니다.'
			},
			{
				status: 400,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const parsed = parseSubscriptionInput(payload);
	if (!parsed) {
		return json(
			{
				success: false,
				error: '웹푸시 구독 정보가 유효하지 않습니다.'
			},
			{
				status: 400,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	await ensureDailyCheckInfrastructure(db);
	const saved = await upsertPushSubscription(db, parsed);
	if (!saved) {
		return json(
			{
				success: false,
				error: '구독 정보 저장에 실패했습니다.'
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	return json(
		{
			success: true
		},
		{
			headers: { 'Cache-Control': 'no-store' }
		}
	);
};

export const DELETE: RequestHandler = async ({ platform, request }) => {
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

	const payload = (await request.json().catch(() => null)) as PushSubscriptionPayload | null;
	const endpoint = typeof payload?.endpoint === 'string' ? payload.endpoint.trim() : '';
	if (!endpoint) {
		return json(
			{
				success: false,
				error: '삭제할 구독 endpoint가 필요합니다.'
			},
			{
				status: 400,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	await ensureDailyCheckInfrastructure(db);
	const removed = await removePushSubscriptionByEndpoint(db, endpoint);
	return json(
		{
			success: true,
			removed
		},
		{
			headers: { 'Cache-Control': 'no-store' }
		}
	);
};
