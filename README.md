# Rosemary v2

SvelteKit + Cloudflare Workers/D1 기반 개인용 유틸리티 앱입니다.

## Features

- `Daily Check`: 출석/임무/일일퀘스트 체크리스트, 항목 CRUD, 자동 리셋, 인앱 알림, 웹푸시
- `Hitomi Tracker`: 기존 크롤링/히스토리 기능

## Local Development

```bash
pnpm install
pnpm run dev
```

검증 명령:

```bash
pnpm run check
pnpm run test
```

## Daily Check 설정

### 1) D1 마이그레이션

`migrations/0013_daily_check_tables.sql` 이 포함되어 있습니다.

### 2) VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

생성된 값을 아래 환경 변수에 설정합니다.

### 3) 앱 워커 환경 변수/시크릿

`wrangler.jsonc`:

- `VAPID_PUBLIC_KEY` (vars)
- `WEB_PUSH_SUBJECT` (vars, 예: `mailto:you@example.com`)
- `APP_BASE_URL` (vars, 예: `https://your-app.example.com`)

시크릿:

```bash
wrangler secret put DAILY_CHECK_CRON_TOKEN
wrangler secret put VAPID_PRIVATE_KEY
```

### 4) 크론 워커 배포

`workers/daily-check-cron/wrangler.toml` 의 `DAILY_CHECK_DISPATCH_URL`를 앱 도메인으로 수정 후:

```bash
cd workers/daily-check-cron
wrangler secret put DAILY_CHECK_CRON_TOKEN
wrangler deploy
```

크론 워커는 매 1분마다 `/api/daily-check/dispatch`를 호출합니다.

## Web Push 동작

1. `/daily-check` 페이지에서 `웹푸시 구독` 클릭
2. 브라우저 알림 권한 승인
3. 구독 정보가 `/api/daily-check/push-subscriptions`에 저장
4. 크론 워커가 `/api/daily-check/dispatch` 호출
5. 미완료 항목이 있을 경우 푸시 전송

## 주요 경로

- `/daily-check`
- `/hitomi-tracker`
- `/api/daily-check/push-subscriptions`
- `/api/daily-check/reminders`
- `/api/daily-check/dispatch`
