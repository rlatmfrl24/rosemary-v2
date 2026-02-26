ALTER TABLE `daily_check_items` ADD COLUMN `importance` text DEFAULT 'normal' NOT NULL;
--> statement-breakpoint
ALTER TABLE `daily_check_items` ADD COLUMN `resetTimes` text DEFAULT '["09:00"]' NOT NULL;
--> statement-breakpoint
UPDATE `daily_check_items`
SET `importance` = 'normal'
WHERE `importance` IS NULL OR trim(`importance`) = '';
--> statement-breakpoint
UPDATE `daily_check_items`
SET `resetTimes` = json_array(`resetTime`)
WHERE (`resetTimes` IS NULL OR trim(`resetTimes`) = '' OR `resetTimes` = '[]')
	AND `resetTime` IS NOT NULL
	AND trim(`resetTime`) != '';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `daily_check_items_importance_idx` ON `daily_check_items` (`importance`);
