# Rosemary v2

SvelteKit + Cloudflare Workers/D1 기반 개인용 유틸리티 앱입니다.

## Features

- `Daily Check`: 출석/임무/일일퀘스트 체크리스트, 항목 CRUD, 자동 리셋, 인앱 리마인더
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

`migrations/0013_daily_check_tables.sql` 및 후속 마이그레이션이 포함되어 있습니다.

### 2) 앱 워커 환경 변수

`wrangler.jsonc`:

- `APP_BASE_URL` (vars, 예: `https://your-app.example.com`)

## 주요 경로

- `/daily-check`
- `/hitomi-tracker`
- `/api/daily-check/reminders`
