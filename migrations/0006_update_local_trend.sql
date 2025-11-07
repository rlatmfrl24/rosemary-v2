-- local-trend 테이블 수정: target_host, target_path 제거 및 downloaded 추가

-- 1. 새 테이블 구조로 임시 테이블 생성
CREATE TABLE `local-trend-new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`downloaded` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);

-- 2. 기존 데이터를 새 테이블로 복사 (downloaded는 기본값 0으로)
INSERT INTO `local-trend-new` (`id`, `name`, `downloaded`, `createdAt`)
SELECT `id`, `name`, 0, `createdAt` FROM `local-trend`;

-- 3. 기존 테이블 삭제
DROP TABLE `local-trend`;

-- 4. 새 테이블의 이름을 원래 이름으로 변경
ALTER TABLE `local-trend-new` RENAME TO `local-trend`;


