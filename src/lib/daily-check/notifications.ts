const PUSH_SUBSCRIPTION_API_PATH = '/api/daily-check/push-subscriptions';

interface SerializablePushSubscription {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

export interface PushActionResult {
	success: boolean;
	message: string;
}

function toUint8Array(base64Url: string): Uint8Array {
	const normalized = base64Url
		.trim()
		.replace(/-/g, '+')
		.replace(/_/g, '/')
		.padEnd(Math.ceil(base64Url.length / 4) * 4, '=');

	const raw = atob(normalized);
	return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function serializeSubscription(subscription: PushSubscription): SerializablePushSubscription | null {
	const json = subscription.toJSON();
	if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
		return null;
	}

	return {
		endpoint: json.endpoint,
		keys: {
			p256dh: json.keys.p256dh,
			auth: json.keys.auth
		}
	};
}

async function ensureRegistration(): Promise<ServiceWorkerRegistration> {
	if (!('serviceWorker' in navigator)) {
		throw new Error('서비스 워커를 지원하지 않는 브라우저입니다.');
	}

	try {
		const existing = await navigator.serviceWorker.ready;
		if (existing) return existing;
	} catch {
		// ready가 실패하면 직접 등록으로 fallback
	}

	return navigator.serviceWorker.register('/service-worker.js');
}

async function upsertServerSubscription(
	subscription: SerializablePushSubscription,
	userAgent: string
): Promise<void> {
	const response = await fetch(PUSH_SUBSCRIPTION_API_PATH, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			subscription,
			userAgent
		})
	});

	if (!response.ok) {
		const result = (await response.json().catch(() => null)) as { error?: string } | null;
		throw new Error(result?.error ?? '서버에 알림 구독 저장에 실패했습니다.');
	}
}

async function removeServerSubscription(endpoint: string): Promise<void> {
	await fetch(PUSH_SUBSCRIPTION_API_PATH, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({ endpoint })
	});
}

export function isWebPushSupported(): boolean {
	return (
		typeof window !== 'undefined' &&
		'Notification' in window &&
		'serviceWorker' in navigator &&
		'PushManager' in window
	);
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
	if (!isWebPushSupported()) return 'unsupported';
	return Notification.permission;
}

export async function hasActivePushSubscription(): Promise<boolean> {
	if (!isWebPushSupported()) return false;
	const registration = await ensureRegistration();
	const subscription = await registration.pushManager.getSubscription();
	return subscription !== null;
}

export async function subscribeToDailyCheckPush(vapidPublicKey: string): Promise<PushActionResult> {
	if (!isWebPushSupported()) {
		return { success: false, message: '이 브라우저는 웹푸시를 지원하지 않습니다.' };
	}
	if (!vapidPublicKey) {
		return { success: false, message: 'VAPID 공개키가 설정되지 않았습니다.' };
	}

	let permission = Notification.permission;
	if (permission !== 'granted') {
		permission = await Notification.requestPermission();
	}
	if (permission !== 'granted') {
		return { success: false, message: '브라우저 알림 권한이 필요합니다.' };
	}

	const registration = await ensureRegistration();
	let subscription = await registration.pushManager.getSubscription();
	if (!subscription) {
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: toUint8Array(vapidPublicKey)
		});
	}

	const serializable = serializeSubscription(subscription);
	if (!serializable) {
		return { success: false, message: '푸시 구독 정보를 읽을 수 없습니다.' };
	}

	await upsertServerSubscription(serializable, navigator.userAgent);
	return { success: true, message: '웹푸시 알림이 활성화되었습니다.' };
}

export async function unsubscribeFromDailyCheckPush(): Promise<PushActionResult> {
	if (!isWebPushSupported()) {
		return { success: false, message: '이 브라우저는 웹푸시를 지원하지 않습니다.' };
	}

	const registration = await ensureRegistration();
	const subscription = await registration.pushManager.getSubscription();
	if (!subscription) {
		return { success: true, message: '이미 웹푸시 알림이 해지된 상태입니다.' };
	}

	await removeServerSubscription(subscription.endpoint);
	await subscription.unsubscribe();

	return { success: true, message: '웹푸시 알림을 해지했습니다.' };
}

export async function syncDailyCheckPushSubscription(vapidPublicKey: string): Promise<void> {
	if (!isWebPushSupported() || Notification.permission !== 'granted' || !vapidPublicKey) return;

	const registration = await ensureRegistration();
	const subscription = await registration.pushManager.getSubscription();
	if (!subscription) return;

	const serializable = serializeSubscription(subscription);
	if (!serializable) return;

	await upsertServerSubscription(serializable, navigator.userAgent);
}
