import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/server/db/schema.ts", // 스키마 파일 경로
	out: "./migrations", // 마이그레이션 파일이 저장될 폴더
	dialect: "sqlite", // D1은 SQLite 호환
	driver: "d1-http", // 사용할 드라이버 지정
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
		databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
		token: process.env.CLOUDFLARE_TOKEN ?? "",
	},
});
