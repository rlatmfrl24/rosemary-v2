import { onMount, onDestroy } from 'svelte';

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
	let crawlError = $state<string | null>(null);

	return {
		get isLoading() {
			return isLoading;
		},
		get isClearHistoryLoading() {
			return isClearHistoryLoading;
		},
		get crawlError() {
			return crawlError;
		},
		setLoading(loading: boolean) {
			isLoading = loading;
		},
		setClearHistoryLoading(loading: boolean) {
			isClearHistoryLoading = loading;
		},
		setCrawlError(error: string | null) {
			crawlError = error;
		},
		clearCrawlError() {
			crawlError = null;
		}
	};
}

/**
 * 폼 enhance 핸들러 생성 함수
 */
export function createEnhanceHandler(setLoading: (loading: boolean) => void) {
	return () => {
		setLoading(true);
		return async ({ update }: { update: () => Promise<void> }) => {
			try {
				await update();
			} finally {
				setLoading(false);
			}
		};
	};
}

/**
 * 크롤링 전용 enhance 핸들러 생성 함수
 */
export function createCrawlEnhanceHandler(
	setLoading: (loading: boolean) => void,
	setCrawlError: (error: string | null) => void
) {
	return () => {
		setLoading(true);
		setCrawlError(null); // 새로운 요청 시 이전 에러 클리어

		return async ({
			result,
			update
		}: {
			result: {
				type: string;
				data?: {
					success?: boolean;
					error?: string;
				};
			};
			update: () => Promise<void>;
		}) => {
			try {
				await update();

				// 폼 액션 결과 확인
				if (result.type === 'success' && result.data) {
					if (!result.data.success && result.data.error) {
						setCrawlError(result.data.error);
					}
				}
			} finally {
				setLoading(false);
			}
		};
	};
}
