/**
 * Unix timestamp를 Date 객체로 변환하는 유틸리티 함수
 * @param timestamp - Unix 타임스탬프 (초 단위) 또는 문자열
 * @returns Date 객체 또는 null (유효하지 않은 경우)
 */
export function parseTimestamp(timestamp: number | string | null): Date | null {
	if (!timestamp && timestamp !== 0) return null;

	let numericTimestamp: number;

	if (typeof timestamp === 'number') {
		numericTimestamp = timestamp;
	} else if (typeof timestamp === 'string') {
		const parsed = parseInt(timestamp, 10);
		if (isNaN(parsed)) return null;
		numericTimestamp = parsed;
	} else {
		return null;
	}

	// timestamp가 0이면 null 반환 (1970-01-01 방지)
	if (numericTimestamp === 0) return null;

	// timestamp가 너무 작거나 크면 무효한 것으로 간주
	// 1980년 이전이거나 2050년 이후면 무효한 것으로 간주
	const minTimestamp = 315532800; // 1980-01-01 00:00:00 UTC
	const maxTimestamp = 2524608000; // 2050-01-01 00:00:00 UTC

	if (numericTimestamp < minTimestamp || numericTimestamp > maxTimestamp) {
		// 밀리초 단위로 저장된 경우를 고려해서 1000으로 나누어 확인
		const timestampInSeconds = Math.floor(numericTimestamp / 1000);
		if (timestampInSeconds >= minTimestamp && timestampInSeconds <= maxTimestamp) {
			// 이미 밀리초 단위인 경우
			const date = new Date(numericTimestamp);
			return isNaN(date.getTime()) ? null : date;
		}
		return null;
	}

	// 초 단위 timestamp를 밀리초로 변환
	const date = new Date(numericTimestamp * 1000);

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
	// timestamp가 없거나 null인 경우
	if (!timestamp && timestamp !== 0) return '크롤링 기록이 없습니다';

	const date = parseTimestamp(timestamp);
	if (!date) {
		// 디버깅을 위한 정보 포함
		console.warn('Invalid timestamp in formatLastCrawlTime:', timestamp);
		return '시간 형식 오류';
	}

	// referenceTime이 유효한지 확인
	if (!referenceTime || isNaN(referenceTime.getTime())) {
		console.warn('Invalid referenceTime in formatLastCrawlTime:', referenceTime);
		return date.toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const diffMs = referenceTime.getTime() - date.getTime();

	// 미래 시간인 경우 (시스템 시간이 잘못되었을 수 있음)
	if (diffMs < 0) {
		return date.toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

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
