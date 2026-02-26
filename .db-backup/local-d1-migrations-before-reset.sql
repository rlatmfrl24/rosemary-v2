PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0000_closed_martin_li.sql','2025-06-12 02:26:00');
INSERT INTO "d1_migrations" VALUES(2,'0001_melted_shatterstar.sql','2025-06-12 04:24:26');
INSERT INTO "d1_migrations" VALUES(3,'0002_even_harpoon.sql','2025-06-23 04:23:36');
INSERT INTO "d1_migrations" VALUES(4,'0003_spooky_phalanx.sql','2025-06-24 05:28:37');
INSERT INTO "d1_migrations" VALUES(5,'0004_mixed_mad_thinker.sql','2025-06-29 22:26:21');
INSERT INTO "d1_migrations" VALUES(6,'0005_curious_pestilence.sql','2025-11-06 23:32:27');
INSERT INTO "d1_migrations" VALUES(7,'0006_update_local_trend.sql','2025-11-07 00:05:53');
INSERT INTO "d1_migrations" VALUES(8,'0006_mixed_robin_chapel.sql','2026-01-06 22:42:30');
INSERT INTO "d1_migrations" VALUES(9,'0007_flaky_the_spike.sql','2026-01-07 00:28:33');
INSERT INTO "d1_migrations" VALUES(10,'0008_add_post_url.sql','2026-01-07 01:25:47');
INSERT INTO "d1_migrations" VALUES(11,'0009_cuddly_blue_marvel.sql','2026-01-07 05:50:00');
INSERT INTO "d1_migrations" VALUES(12,'0010_add_twitter_url.sql','2026-01-15 00:07:17');
INSERT INTO "d1_migrations" VALUES(13,'0011_drop_weekly_check_tables.sql','2026-02-24 06:55:56');
INSERT INTO "d1_migrations" VALUES(14,'0012_hitomi_tracker_hardening.sql','2026-02-24 06:55:56');
INSERT INTO "d1_migrations" VALUES(15,'0013_daily_check_tables.sql','2026-02-26 01:26:19');
INSERT INTO "d1_migrations" VALUES(16,'0014_daily_check_importance_reset_times.sql','2026-02-26 01:27:03');