import { toast } from 'svelte-sonner';
import type { HitomiItem } from './types';
import { copyToClipboard } from './utils';

/**
 * 코드 복사 액션
 * @param items - Hitomi 아이템 목록
 */
export async function handleCopyCodesClick(items: HitomiItem[]) {
	const codes = items.map((item) => item.code).join('\n');
	const success = await copyToClipboard(codes);

	if (success) {
		toast.success('Codes copied to clipboard', {
			description: 'You can paste them into the search bar of Hitomi'
		});
	} else {
		toast.error('Failed to copy codes', {
			description: 'Please try again'
		});
	}
}

/**
 * 행 클릭 액션
 * @param item - 클릭된 Hitomi 아이템
 */
export function handleRowClick(item: HitomiItem) {
	window.open(item.url, '_blank');
}

/**
 * 키보드 이벤트 핸들러
 * @param event - 키보드 이벤트
 * @param item - Hitomi 아이템
 */
export function handleKeyDown(event: KeyboardEvent, item: HitomiItem) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		handleRowClick(item);
	}
}
