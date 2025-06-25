/**
 * Unix timestamp를 Date 객체로 변환하는 유틸리티 함수
 * @param timestamp - Unix 타임스탬프 (초 단위) 또는 문자열
 * @returns Date 객체 또는 null (유효하지 않은 경우)
 */
export function parseTimestamp(timestamp: number | string | null): Date | null {
	if (!timestamp) return null;

	let date: Date;

	if (typeof timestamp === 'number') {
		date = new Date(timestamp * 1000);
	} else if (typeof timestamp === 'string') {
		const numTimestamp = parseInt(timestamp, 10);
		if (isNaN(numTimestamp)) return null;
		date = new Date(numTimestamp * 1000);
	} else {
		return null;
	}

	// 유효한 날짜인지 확인
	return isNaN(date.getTime()) ? null : date;
}

/**
 * 시간 차이를 사람이 읽기 쉬운 형태로 포맷하는 함수
 * @param timestamp - Unix 타임스탬프
 * @param referenceTime - 기준 시간 (현재 시간)
 * @returns 포맷된 시간 문자열
 */
export function formatLastCrawlTime(
	timestamp: number | string | null,
	referenceTime: Date
): string {
	if (!timestamp) return '크롤링 기록이 없습니다';

	const date = parseTimestamp(timestamp);
	if (!date) return '시간 형식 오류';

	const diffMs = referenceTime.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) return '방금 전';
	if (diffMinutes < 60) return `${diffMinutes}분 전`;
	if (diffHours < 24) return `${diffHours}시간 전`;
	if (diffDays < 7) return `${diffDays}일 전`;

	// 일주일이 지난 경우 절대 시간 표시
	return date.toLocaleString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * 생성일시를 포맷하는 함수
 * @param timestamp - Unix 타임스탬프
 * @returns 포맷된 날짜 문자열
 */
export function formatCreatedAt(timestamp: number | string): string {
	const date = parseTimestamp(timestamp);
	if (!date) return '날짜 오류';

	return date.toLocaleString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * 클립보드에 텍스트를 복사하는 함수
 * @param text - 복사할 텍스트
 * @returns 복사 성공 여부
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		return false;
	}
}
