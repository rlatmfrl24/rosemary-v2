import { onMount, onDestroy } from 'svelte';
import type { EnhanceResult } from './types';

/**
 * 실시간 시간 업데이트를 위한 커스텀 훅
 * @param intervalMs - 업데이트 간격 (밀리초)
 * @returns 현재 시간을 반환하는 reactive 값
 */
export function useCurrentTime(intervalMs: number = 60000) {
	// 1분마다 업데이트로 변경
	let currentTime = $state(new Date());
	let timeInterval: NodeJS.Timeout;

	onMount(() => {
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, intervalMs);
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	});

	return {
		get current() {
			return currentTime;
		}
	};
}

/**
 * 로딩 상태 관리를 위한 커스텀 훅
 */
export function useLoadingState() {
	let isLoading = $state(false);
	let isClearHistoryLoading = $state(false);

	return {
		get isLoading() {
			return isLoading;
		},
		get isClearHistoryLoading() {
			return isClearHistoryLoading;
		},
		setLoading(loading: boolean) {
			isLoading = loading;
		},
		setClearHistoryLoading(loading: boolean) {
			isClearHistoryLoading = loading;
		}
	};
}

/**
 * 폼 enhance 핸들러 생성 함수
 */
export function createEnhanceHandler(setLoading: (loading: boolean) => void) {
	return () => {
		setLoading(true);
		return async ({ update }: EnhanceResult) => {
			try {
				await update();
			} finally {
				setLoading(false);
			}
		};
	};
}

/**
 * Clear history 전용 enhance 핸들러 생성 함수
 */
export function createClearHistoryEnhanceHandler(
	setLoading: (loading: boolean) => void,
	closeDialog: () => void
) {
	return () => {
		setLoading(true);
		return async ({ update }: EnhanceResult) => {
			try {
				await update();
				closeDialog();
			} finally {
				setLoading(false);
			}
		};
	};
}
