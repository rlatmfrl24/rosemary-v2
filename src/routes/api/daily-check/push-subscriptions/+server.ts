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

const PUSH_ENDPOINT_PATTERNS: RegExp[] = [
	/^https:\/\/fcm\.googleapis\.com\/fcm\/send\/[A-Za-z0-9_\-:.%]+$/,
	/^https:\/\/updates\.push\.services\.mozilla\.com\/wpush\/v[0-9]+\/[A-Za-z0-9_\-:.%]+$/,
	/^https:\/\/(?:[a-z0-9-]+\.)?notify\.windows\.com\/\S+$/i,
	/^https:\/\/web\.push\.apple\.com\/\S+$/i,
	/^https:\/\/(?:[a-z0-9-]+\.)?push\.apple\.com\/\S+$/i
];
const BASE64_URL_PATTERN = /^[A-Za-z0-9\-_]+$/;

function getDb(platform: App.Platform | undefined): D1Database | null {
	return platform?.env?.DB ?? null;
}

function isValidPushEndpoint(endpoint: string): boolean {
	if (endpoint.length < 16 || endpoint.length > 2048) return false;

	let parsed: URL;
	try {
		parsed = new URL(endpoint);
	} catch {
		return false;
	}

	if (parsed.protocol !== 'https:') return false;
	if (parsed.username || parsed.password) return false;
	return PUSH_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint));
}

function isValidBase64UrlToken(token: string, minLength: number, maxLength: number): boolean {
	return token.length >= minLength && token.length <= maxLength && BASE64_URL_PATTERN.test(token);
}

function parseSubscriptionInput(payload: PushSubscriptionPayload) {
	const subscription = payload.subscription;
	const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint.trim() : '';
	const p256dh =
		typeof subscription?.keys?.p256dh === 'string' ? subscription.keys.p256dh.trim() : '';
	const auth = typeof subscription?.keys?.auth === 'string' ? subscription.keys.auth.trim() : '';
	const userAgentRaw = typeof payload.userAgent === 'string' ? payload.userAgent.trim() : '';
	const userAgent = userAgentRaw ? userAgentRaw.slice(0, 500) : null;

	if (!endpoint || !p256dh || !auth) return null;
	if (!isValidPushEndpoint(endpoint)) return null;
	if (!isValidBase64UrlToken(p256dh, 40, 512)) return null;
	if (!isValidBase64UrlToken(auth, 12, 128)) return null;

	return { endpoint, p256dh, auth, userAgent };
}

function parseEndpoint(payload: PushSubscriptionPayload | null): string {
	const endpoint = typeof payload?.endpoint === 'string' ? payload.endpoint.trim() : '';
	return endpoint;
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
	const endpoint = parseEndpoint(payload);
	if (!endpoint || !isValidPushEndpoint(endpoint)) {
		return json(
			{
				success: false,
				error: '삭제할 유효한 구독 endpoint가 필요합니다.'
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
