# Rosemary v2

SvelteKit + Cloudflare Workers/D1 기반 개인용 유틸리티 앱입니다.

## Features

- `Daily Check`: 출석/임무/일일퀘스트 체크리스트, 항목 CRUD, 자동 리셋, 인앱 리마인더, 웹푸시
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

`migrations/0013_daily_check_tables.sql` 및 후속 마이그레이션(`0014`, `0015`, `0016`)이 포함되어 있습니다.

### 2) VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

생성된 `publicKey`, `privateKey`를 아래 설정에 사용합니다.

### 3) 앱 워커 vars / secrets

`wrangler.jsonc` vars:

- `APP_BASE_URL` (예: `https://your-app.example.com`)
- `WEB_PUSH_SUBJECT` (예: `mailto:you@example.com`)
- `VAPID_PUBLIC_KEY`
- `DAILY_CHECK_DEFAULT_OFFSET_MINUTES` (기본 15)

secrets:

```bash
wrangler secret put DAILY_CHECK_CRON_TOKEN
wrangler secret put VAPID_PRIVATE_KEY
```

### 4) GitHub Actions cron 설정

`.github/workflows/daily-check-dispatch.yml`가 `*/15 * * * *` 주기로
`/api/daily-check/dispatch`를 호출합니다.

GitHub repository secrets:

- `DAILY_CHECK_DISPATCH_URL` (예: `https://your-app.example.com/api/daily-check/dispatch`)
- `DAILY_CHECK_CRON_TOKEN` (Worker secret과 동일 값)

### 5) 수동 디스패치 점검

1. `/daily-check`에서 `웹푸시 설정`으로 구독 활성화
2. GitHub Actions에서 `Daily Check Dispatch` 워크플로우를 `Run workflow`로 수동 실행
3. 브라우저 푸시 알림 수신 여부 확인
4. 같은 사이클에서 다시 실행 시 중복 알림이 발생하지 않는지 확인

## Web Push 동작

1. 브라우저가 `/api/daily-check/push-subscriptions`에 구독 정보를 저장
2. GitHub Actions cron이 `/api/daily-check/dispatch` 호출
3. 서버가 `resetTime + offset` 이후 미완료 항목만 발송 후보로 계산
4. `itemId + cycleKey + channel` 기준으로 사이클당 1회만 발송

## 주요 경로

- `/daily-check`
- `/hitomi-tracker`
- `/api/daily-check/reminders`
- `/api/daily-check/push-subscriptions`
- `/api/daily-check/dispatch`
