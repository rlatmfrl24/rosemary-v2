import {
	removePushSubscriptionByEndpoint,
	upsertPushSubscription
} from '$lib/server/daily-check/database';
import { ensureDailyCheckInfrastructure } from '$lib/server/daily-check/infrastructure';
import { dev } from '$app/environment';
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

function unauthorizedResponse(message: string) {
	return json(
		{
			success: false,
			error: message
		},
		{
			status: 401,
			headers: { 'Cache-Control': 'no-store' }
		}
	);
}

function extractBearerToken(authorizationHeader: string | null): string | null {
	if (!authorizationHeader?.startsWith('Bearer ')) return null;
	const token = authorizationHeader.slice('Bearer '.length).trim();
	return token || null;
}

function parseAllowedEmails(raw: string | undefined): Set<string> {
	if (!raw) return new Set();
	return new Set(
		raw
			.split(',')
			.map((value) => value.trim().toLowerCase())
			.filter(Boolean)
	);
}

function isLocalDevelopmentRequest(request: Request): boolean {
	let parsed: URL;
	try {
		parsed = new URL(request.url);
	} catch {
		return false;
	}

	const host = parsed.hostname.toLowerCase();
	const normalizedHost =
		host.startsWith('[') && host.endsWith(']') ? host.slice(1, host.length - 1) : host;
	if (normalizedHost === 'localhost' || normalizedHost.endsWith('.localhost')) return true;
	if (normalizedHost === '::1' || normalizedHost === '0:0:0:0:0:0:0:1') return true;
	if (/^127(?:\.\d{1,3}){3}$/.test(normalizedHost)) return true;
	if (/^::ffff:127(?:\.\d{1,3}){3}$/.test(normalizedHost)) return true;
	return false;
}

function isTrustedPushSubscriptionCaller(
	request: Request,
	platform: App.Platform | undefined
): boolean {
	if (dev || isLocalDevelopmentRequest(request)) return true;

	const cronToken = platform?.env?.DAILY_CHECK_CRON_TOKEN;
	const bearerToken = extractBearerToken(request.headers.get('Authorization'));
	if (cronToken && bearerToken === cronToken) {
		return true;
	}

	const cfAccessEmail = request.headers.get('CF-Access-Authenticated-User-Email')?.trim().toLowerCase();
	if (!cfAccessEmail) {
		return false;
	}

	const allowedEmails = parseAllowedEmails(platform?.env?.DAILY_CHECK_ALLOWED_EMAILS);
	if (allowedEmails.size === 0) {
		return true;
	}

	return allowedEmails.has(cfAccessEmail);
}

const PUSH_ENDPOINT_PATTERNS: RegExp[] = [
	/^https:\/\/fcm\.googleapis\.com\/fcm\/send\/[A-Za-z0-9_\-:.%]+$/,
	/^https:\/\/updates\.push\.services\.mozilla\.com\/wpush\/v[0-9]+\/[A-Za-z0-9_\-:.%]+$/,
	/^https:\/\/(?:[a-z0-9-]+\.)?notify\.windows\.com\/\S+$/i,
	/^https:\/\/web\.push\.apple\.com\/\S+$/i,
	/^https:\/\/(?:[a-z0-9-]+\.)?push\.apple\.com\/\S+$/i
];

const BASE64_URL_PATTERN = /^[A-Za-z0-9\-_]+$/;

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

	if (!endpoint || !p256dh || !auth) {
		return null;
	}
	if (!isValidPushEndpoint(endpoint)) {
		return null;
	}
	if (!isValidBase64UrlToken(p256dh, 40, 512) || !isValidBase64UrlToken(auth, 12, 128)) {
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
	if (!isTrustedPushSubscriptionCaller(request, platform)) {
		return unauthorizedResponse(
			'Trusted caller authentication is required. (Cloudflare Access or Bearer token)'
		);
	}

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
	if (!isTrustedPushSubscriptionCaller(request, platform)) {
		return unauthorizedResponse(
			'Trusted caller authentication is required. (Cloudflare Access or Bearer token)'
		);
	}

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
