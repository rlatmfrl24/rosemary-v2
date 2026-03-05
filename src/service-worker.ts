/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

interface ReminderResponsePayload {
	success: boolean;
	reminder: {
		itemCount: number;
		totalEstimatedMinutes: number;
	} | null;
}

async function buildNotificationBody(): Promise<string> {
	try {
		const response = await fetch('/api/daily-check/reminders', {
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) return '출석체크할 항목이 있는지 확인해 주세요.';

		const payload = (await response.json()) as ReminderResponsePayload;
		if (!payload.success || !payload.reminder || payload.reminder.itemCount === 0) {
			return '오늘 출석체크 상태를 점검해 주세요.';
		}

		if (payload.reminder.totalEstimatedMinutes > 0) {
			return `${payload.reminder.itemCount}개 미완료 · 예상 ${payload.reminder.totalEstimatedMinutes}분`;
		}
		return `${payload.reminder.itemCount}개의 미완료 출석 항목이 있습니다.`;
	} catch (error) {
		console.warn('Failed to fetch reminder summary in service worker', error);
		return '출석체크할 항목이 있는지 확인해 주세요.';
	}
}

self.addEventListener('push', (event) => {
	event.waitUntil(
		(async () => {
			const body = await buildNotificationBody();
			await self.registration.showNotification('Daily Check Reminder', {
				body,
				tag: 'daily-check-reminder',
				badge: '/favicon.png',
				icon: '/favicon.png',
				renotify: false,
				data: {
					url: '/daily-check'
				}
			});
		})()
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const targetUrl =
		typeof event.notification.data?.url === 'string' ? event.notification.data.url : '/daily-check';

	event.waitUntil(
		(async () => {
			const clientList = await self.clients.matchAll({
				type: 'window',
				includeUncontrolled: true
			});

			for (const client of clientList) {
				const windowClient = client as WindowClient;
				if ('focus' in windowClient) {
					await windowClient.focus();
					if (windowClient.url !== targetUrl && 'navigate' in windowClient) {
						await windowClient.navigate(targetUrl);
					}
					return;
				}
			}

			await self.clients.openWindow(targetUrl);
		})()
	);
});
