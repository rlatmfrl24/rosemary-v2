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
CREATE TABLE IF NOT EXISTS "hitomi-history" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
INSERT INTO "hitomi-history" VALUES(4970,'3413902','[Battle Kisetsu (Dodeka Unagi)] Ro~do Shi su! (Blue Archive) [Digital]  [Korean]','Doujinshi','https://e-hentai.org/g/3413902/faf41b6dfe/',1750905767);
INSERT INTO "hitomi-history" VALUES(4971,'3413868','[Yuio] Espeon&Umbreon','Artist CG','https://e-hentai.org/g/3413868/bcfd623d7b/',1750905767);
INSERT INTO "hitomi-history" VALUES(4972,'3413613','[Nishida Megane] Deka Chichi Kanojo Hatsujouchuu!! | 데카 가슴 그녀 발정중!! Ch. 1-4 [Korean] [뉴비라] [Digital]','Manga','https://e-hentai.org/g/3413613/dd1c36a471/',1750905767);
INSERT INTO "hitomi-history" VALUES(4973,'3413580','[Takaman] Yamashiro (Kantai Collection -KanColle-) [Korean]','Doujinshi','https://e-hentai.org/g/3413580/228b040733/',1750905767);
INSERT INTO "hitomi-history" VALUES(4974,'3413578','[Fence 14] Giji SEX Kyoudai 【Kinshinsoukan】 | 유사 섹스 남매 【근친상간】 [Korean] [Team Edge] [Ongoing]','Doujinshi','https://e-hentai.org/g/3413578/f7950c27bb/',1750905767);
INSERT INTO "hitomi-history" VALUES(4975,'3413552','여름과 시골과 유혹해오는 커다란 제자 3 [Korean] (Sample)','Doujinshi','https://e-hentai.org/g/3413552/2e0a523972/',1750905767);
INSERT INTO "hitomi-history" VALUES(4976,'3413533','[Toneri Dan (Yoshio Ereki)] Shikyuu Kyouiku Amamiya Kako ga Sensei no Ko o Ninshin suru Wake ga Nai [Korean]','Doujinshi','https://e-hentai.org/g/3413533/f795b2e093/',1750905767);
INSERT INTO "hitomi-history" VALUES(4977,'3413438','[Himitsu no Hoshizono (Hoshizono Kanon)] Otto yori Suki na Otoko no Seishi de Haramitai | 남편보다 좋아하는 남자의 정자로 임신하고 싶다 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3413438/eec07ea142/',1750905767);
INSERT INTO "hitomi-history" VALUES(4978,'3413418','[Poriuretan] 逆chiカン [Korean]','Doujinshi','https://e-hentai.org/g/3413418/4ee2fd71e8/',1750905767);
INSERT INTO "hitomi-history" VALUES(4979,'3413247','[roborobocap] CEO and Bodyguard 01-156 [Korean] [ongoing]','Artist CG','https://e-hentai.org/g/3413247/d4227b1a69/',1750905767);
INSERT INTO "hitomi-history" VALUES(4980,'3413212','[Aigamodou (Ayakawa Riku)] Mahou Gakuin no Ochikobore. Tensai Elf Shoujo ni Zenra Kaiho no Mahou o Kaketemita | 마법 학원의 낙오자 천재 엘프 소녀에게 전라 해방의 마법을 걸어보았다 [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3413212/b1ef3ddbf5/',1750905767);
INSERT INTO "hitomi-history" VALUES(4981,'3413203','[Marosaan (Yunamaro)] Deka Onna Joushi to Moto Charao no Kouhai-kun #1 | 폭유 여상사와 양아치였던 후배 #1 [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3413203/4320514b8c/',1750905767);
INSERT INTO "hitomi-history" VALUES(4982,'3413197','[Yamabatake (Yamabatake)] Zako-kan Nerai no Do-M Onna Kishi ga Hontou ni Goblin Dorei ni Sareru Hanashi Zenpen | 잡몹간이 목적인 도M 여기사가 정말로 고블린의 성노예가 되는 이야기 전편 [Korean]','Doujinshi','https://e-hentai.org/g/3413197/0c3f933bc8/',1750905767);
INSERT INTO "hitomi-history" VALUES(4983,'3413196','(C105) [Otaku Beam (Ootsuka Mahiro)] Marika Swing Me Around 2 | 마리카 스윙 미 어라운드 2 [Korean]','Doujinshi','https://e-hentai.org/g/3413196/5b06208ef2/',1750905767);
INSERT INTO "hitomi-history" VALUES(4984,'3413195','[Yajirushi Key (Hoshina Meito)] Dennou Shoujo wa Kasou Sekai ni Shizumi Yuku | 전뇌소녀는 가상 세계에 가라앉아 간다 [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3413195/d1b4fedf2f/',1750905767);
INSERT INTO "hitomi-history" VALUES(4985,'3413176','(C78) [Hellabunna (Iruma kamiri)] MIO-MUGi Densya Chikan | 미오 & 무기 전철치한 (K-ON!) [Korean]','Doujinshi','https://e-hentai.org/g/3413176/78760f5337/',1750905767);
INSERT INTO "hitomi-history" VALUES(4986,'3413124','[taroimobatake (Taroimo Tarou)] Satsuei Yoroshiku Onegaishimasu | 촬영 잘 부탁드립니다♡ (Bomber Girl) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3413124/f04da00acb/',1750905767);
INSERT INTO "hitomi-history" VALUES(4987,'3413063','[TRY&Hougen Futari Shakai (Hougen)] Atarashii Fuuki Iinchou ga Kyonyuu Sugiru Ken 2 | 새로운 풍기위원장이 너무 거유인 건 2 [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3413063/2b95f7e0fe/',1750905767);
INSERT INTO "hitomi-history" VALUES(4988,'3412959','[FLAT (Yukyu Ponzu)] Credit wa Futari de | 크레디트는 둘이서 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3412959/736a432987/',1750905767);
INSERT INTO "hitomi-history" VALUES(4989,'3412685','bunny girl, ROBIN Ver.','Doujinshi','https://e-hentai.org/g/3412685/511612faa2/',1750905767);
INSERT INTO "hitomi-history" VALUES(4990,'3412683','bunny NAMI🍊','Doujinshi','https://e-hentai.org/g/3412683/ce7d7a5ade/',1750905767);
INSERT INTO "hitomi-history" VALUES(4991,'3412682','YAMATO bunny','Doujinshi','https://e-hentai.org/g/3412682/6adcd3e3e2/',1750905767);
INSERT INTO "hitomi-history" VALUES(4992,'3412547','[Pentacle (Shimipan)] Shikatanaku Kaa-chan to Sex Shimasu 1~4 | 어쩔 수 없이 엄마와 섹스합니다 1~4 [Korean]','Doujinshi','https://e-hentai.org/g/3412547/3df1200b45/',1750905767);
INSERT INTO "hitomi-history" VALUES(4993,'3412459','[Danpacino] Jijii ni Nettori Netora Reta Kinniku Tsuma ~39-Sai Moto Bodybuilder no Razoku Tsuma ga 79-Sai Sukebe Gifu to Haitoku Sex~ | 의부에게 질펀하게 네토라레 당한 근육아내 ~39세 전직 보디빌더의 나체족 아내가 79세 색골 의부하고 배덕섹스~ [Korean]','Doujinshi','https://e-hentai.org/g/3412459/ab94b5c0dc/',1750905767);
INSERT INTO "hitomi-history" VALUES(4994,'3412310','[Misaki (Etsudo an)] Boku dake no Yuki Ane | 나만의 유키 누나 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3412310/6279be38ab/',1750905767);
INSERT INTO "hitomi-history" VALUES(4995,'3412220','[Alisame] Boyish Joshi ni Densha de... | 보이쉬한 여자한테 전철에서... [Korean]','Doujinshi','https://e-hentai.org/g/3412220/987ad22794/',1750905767);
INSERT INTO "hitomi-history" VALUES(4996,'3412158','[Futotta Obasan] Deatte 4-Kounen de Gattai | 만나서 4광년만에 합체 [Korean]','Doujinshi','https://e-hentai.org/g/3412158/1d6945a434/',1750905768);
INSERT INTO "hitomi-history" VALUES(4997,'3412143','[Tatejima Kita] Bokura wa Sase-san no Tenohira no Ue (COMIC Kairakuten BEAST 2025-07) [Korean] [팀 털난보리] [Digital]','Manga','https://e-hentai.org/g/3412143/eaddcbc063/',1750905768);
INSERT INTO "hitomi-history" VALUES(4998,'3412048','[Spiritus Tarou] Awaku, Koi, Koi. | 희미하고, 진한, 사랑. [Korean] [Team Edge] [Digital]','Manga','https://e-hentai.org/g/3412048/41b860d738/',1750905768);
INSERT INTO "hitomi-history" VALUES(4999,'3412029','[MANA] Section 6 「1」 (Zenless Zone Zero) [Korean] [Decensored]','Artist CG','https://e-hentai.org/g/3412029/78dc614682/',1750905768);
INSERT INTO "hitomi-history" VALUES(5000,'3411980','[Iwakutuki] Hito-gata kachiku o kau Houhou (COMIC Necrosis Vol. 29) [Korean] [LWND]','Manga','https://e-hentai.org/g/3411980/7b4079a90a/',1750905768);
INSERT INTO "hitomi-history" VALUES(5001,'3411938','[Ankoman] Metatoron jan''nu, yoidore asutorufo ni karama reru ❤ | 메타트론・잔느、술 취한 아스톨포에게 휘말리다❤ (Fate/Grand Order) [Korean]','Doujinshi','https://e-hentai.org/g/3411938/497f017189/',1750905768);
INSERT INTO "hitomi-history" VALUES(5002,'3411839','[burnBRIGHT] Goblin ga Hisomu Dungeon de Kurutte, Midarete, Mawasarete | 고블린이 숨어 있는 던전에서 미치고, 음란해져, 윤간당하다 (1) [Korean]','Doujinshi','https://e-hentai.org/g/3411839/2235086235/',1750905768);
INSERT INTO "hitomi-history" VALUES(5003,'3411835','[Shirabe Shiki] Onaho ni Nareru Potion ② | 오나홀이 되는 포션② [Korean]','Doujinshi','https://e-hentai.org/g/3411835/6fd3e1e5e6/',1750905768);
INSERT INTO "hitomi-history" VALUES(5004,'3411827','[Eonsang] Krolik (Girls'' Frontline)','Doujinshi','https://e-hentai.org/g/3411827/02e6d16c35/',1750905768);
INSERT INTO "hitomi-history" VALUES(5005,'3411802','[Ankoman] Mizugi Barghest, Astolfo to Nakayoku Naru | 수영복 바게스트, 아스톨포와 친해지다 (Fate/Grand Order) [Korean]','Doujinshi','https://e-hentai.org/g/3411802/7d6c186a6e/',1750905768);
INSERT INTO "hitomi-history" VALUES(5006,'3411749','[Arkham] Sengoku Zankoku Emaki Sono San Ochimusha no Matsuro(korean) 전국잔혹이야기 세번째','Artist CG','https://e-hentai.org/g/3411749/84d81b691f/',1750905768);
INSERT INTO "hitomi-history" VALUES(5007,'3411673','[Kasoku] Kaiko no Hitotsuoboe | 누에의 외고집 (WEEKLY Kairakuten 2025 No.21) [Korean] [LWND] [Digital]','Manga','https://e-hentai.org/g/3411673/b03e33faac/',1750905768);
INSERT INTO "hitomi-history" VALUES(5008,'3411588','[Ringo Club] Hime Hina wa Sasoitai Hen | 히메히나는 유혹하고 싶어 편 (Tanaka Hime, Suzuki Hina) [Korean]','Doujinshi','https://e-hentai.org/g/3411588/abb731fb73/',1750905768);
INSERT INTO "hitomi-history" VALUES(5009,'3411466','[Oshima Aki] NEET Onee-chan to Boku ~Seitsuu Mae kara Toshiue Itoko to Yari Makutteta Hanashi~ | 니트 누나와 나 ~2차 성징 전부터 연상 사촌과 마구 해댄 이야기~ [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411466/5bd582f390/',1750905768);
INSERT INTO "hitomi-history" VALUES(5010,'3411465','[Amrita] Apologies! | 죄송합니다! [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411465/ab02cb33be/',1750905768);
INSERT INTO "hitomi-history" VALUES(5011,'3411460','[Misaki (Akutenkou)] Hatsukoi no Hito wa, Tomodachi no Mama. | 첫사랑은, 친구 엄마. [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3411460/9b67b73bea/',1750905768);
INSERT INTO "hitomi-history" VALUES(5012,'3411459','[Okina Keikaku (Shiwasu no Okina)] 100-Kai Furareta Zetsubou-teki ni Motenai Ore o Awarenda Kareshi Ari Onna Tomodachi ga Nandemo Eroi Koto Yarasete Kureta!! | 100번 차여버린 절망적으로 인기 없는 나를 불쌍히 여겨준 남친 있는 여자사람친구가 뭐든지 야한 짓 하게 해줬다!! [Korean]','Doujinshi','https://e-hentai.org/g/3411459/ca95e1b2fa/',1750905768);
INSERT INTO "hitomi-history" VALUES(5013,'3411458','[Shiwasu no Okina] Kanojyo Kareshi Kanojyo | 그녀 그이 그녀 (Ero Pippi) [Korean] [Decensored]','Manga','https://e-hentai.org/g/3411458/ed038d1d14/',1750905768);
INSERT INTO "hitomi-history" VALUES(5014,'3411457','[Yamamoto] BITCH GIRLFRIEND (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411457/23df49f577/',1750905768);
INSERT INTO "hitomi-history" VALUES(5015,'3411456','[Yamamoto] Heroine o Okashichae! | 정의의 히어로 강간! (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411456/5962c25030/',1750905768);
INSERT INTO "hitomi-history" VALUES(5016,'3411455','[Yamamoto] Hard na Oshigoto! | 이건 어려운 일입니다! (Dragon Ball) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411455/5eaa5af5ff/',1750905768);
INSERT INTO "hitomi-history" VALUES(5017,'3411454','[Yamamoto] Lost of sex in this Future! - BULMA and GOHAN (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411454/6a0eee8961/',1750905768);
INSERT INTO "hitomi-history" VALUES(5018,'3411453','[Yamamoto] Bunny Girl Transformation | 바니걸 변신 (Dragon Ball) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3411453/62a1f42ace/',1750905768);
INSERT INTO "hitomi-history" VALUES(5019,'3411452','[Yamamoto] Mata Oolong wa Bulma o Damashi Chau? (Dragon Ball) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3411452/61c0dd7c6c/',1750905768);
INSERT INTO "hitomi-history" VALUES(5020,'3410524','[Alisame] Nakanoii Yankee ni Ukkari Suki na ko o Oshiete Shimatta','Doujinshi','https://e-hentai.org/g/3410524/534b852300/',1750905768);
INSERT INTO "hitomi-history" VALUES(5021,'3410523','[DogStyle (Menea the Dog)] Hatsuboshi Cream Pie Vol.2 Hathuboshi Katakoi Ninniku Aburamashimashi (GAKUEN iDOLM@STER) [Korean]','Doujinshi','https://e-hentai.org/g/3410523/cbaf3883a2/',1750905768);
INSERT INTO "hitomi-history" VALUES(5022,'3410412','[laliberte] 202505 part1 color','Doujinshi','https://e-hentai.org/g/3410412/eeee12752f/',1750905768);
INSERT INTO "hitomi-history" VALUES(5023,'3410401','[ONEONE1] Watashi no Omanko wa Minna no Mono 3 | 내 보지는 모두의 것 3 [Korean]','Doujinshi','https://e-hentai.org/g/3410401/376d8f2074/',1750905768);
INSERT INTO "hitomi-history" VALUES(5024,'3410394','[Mochimochi Warabi] Onaji Mansion ni Sumu Onna-tachi ga Maiban Ore ni Okazu o Todoke ni Kuru Ken [Korean]','Doujinshi','https://e-hentai.org/g/3410394/a103aacb67/',1750905768);
INSERT INTO "hitomi-history" VALUES(5025,'3410392','[Nyuu Koubou (Tomomimi Shimon)] Ie ni Ita Bourei? ga Ore ni Natsuite Mesu Tsurete Kita Ken EX2 [Korean]','Doujinshi','https://e-hentai.org/g/3410392/250b9f683c/',1750905768);
INSERT INTO "hitomi-history" VALUES(5026,'3410389','[Can Do Now! (Minarai Zouhyou)] Couple Channel Netorare Dokkiri!? [Korean]','Doujinshi','https://e-hentai.org/g/3410389/ae96d052e8/',1750905768);
INSERT INTO "hitomi-history" VALUES(5027,'3410388','[Anma] Sukebe Taiiku Kyoushi no Houkago Kairaku Choukyou Lesson | 변태 체육 교사의 방과 후 쾌락 조교 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3410388/d5dbd51c6f/',1750905768);
INSERT INTO "hitomi-history" VALUES(5028,'3410355','[Takaman] Yamashiro (Kantai Collection -KanColle-) [Korean]','Doujinshi','https://e-hentai.org/g/3410355/af33614ce0/',1750905768);
INSERT INTO "hitomi-history" VALUES(5029,'3410296','[Ikari no Mofumofu Kintama ga Gekitotsu] Ōkoku Kanraku,-kyō ￮ Songen Hakai Jigoku 〜 Haiboku Shita On''na Kishi ga Baka Marudashi no Ganimata Pōzu o Warawa re, Sokoku de Sarashi-sha ni Naru Made no Kutsujoku no hi~','Doujinshi','https://e-hentai.org/g/3410296/4ac78f939c/',1750905768);
INSERT INTO "hitomi-history" VALUES(5030,'3410294','[laliberte] 202506 Part2 (color)','Doujinshi','https://e-hentai.org/g/3410294/8286c412dd/',1750905768);
INSERT INTO "hitomi-history" VALUES(5031,'3410148','[Oyama Dennou Giken] immoral city 부덕의 도시 (korean)','Artist CG','https://e-hentai.org/g/3410148/5df589c168/',1750905768);
INSERT INTO "hitomi-history" VALUES(5032,'3410139','[burnBRIGHT] Senritsu no Creature -Haiboku no Onna Heishi- | 전율의 크리처 -패배한 여군- (Ryona King Vol. 23) [Korean]','Doujinshi','https://e-hentai.org/g/3410139/986acad8a3/',1750905768);
INSERT INTO "hitomi-history" VALUES(5033,'3410128','[Doraias Kazuyo] Watashi ga Anata o Sasaeru kara...♥ | 내가 당신을 보태어 줄테니까...♥ [Korean]','Doujinshi','https://e-hentai.org/g/3410128/c94148d591/',1750905768);
INSERT INTO "hitomi-history" VALUES(5034,'3410106','(C105) [Cocoa Holic (Yuizaki Kazuya)] Kotone Soapland | 코토네 소프랜드 (Gakuen IDOLM@STER) [Korean]','Doujinshi','https://e-hentai.org/g/3410106/6e4e4c692e/',1750905768);
INSERT INTO "hitomi-history" VALUES(5035,'3410077','[Konoshige] 부탁하면 무엇이든 해주는소꿉친구 여친 (Korean)','Image Set','https://e-hentai.org/g/3410077/f0d8afcf9c/',1750905768);
INSERT INTO "hitomi-history" VALUES(5036,'3409773','[Twitter/X] Gobackgu','Image Set','https://e-hentai.org/g/3409773/816b5c32e9/',1750905768);
INSERT INTO "hitomi-history" VALUES(5037,'3409660','[Clesta (Cle Masahiro)] Jogakkou de Otoko Hitori na node Kousoku de Seiyoku no Hakeguchi ni Sareru Nichijou 4.5-Jigenme | 여학교에 남자 한명이라서 교칙으로 성욕의 배출구가 되는 일상 4.5교시 [Korean]','Doujinshi','https://e-hentai.org/g/3409660/79739f9873/',1750905769);
INSERT INTO "hitomi-history" VALUES(5038,'3409394','[Nijiiro Guin] Kaisha no Senpai ga Urusai node Jyuujun na Mesu Ana ni Naru made Kaihatsusuru | 회사 선배가 짜증나기 때문에 순종적인 암컷 구멍이 될 때까지 개발한다 [Korean] [Decensored] [Incomplete]','Doujinshi','https://e-hentai.org/g/3409394/3a4299f3fd/',1750905769);
INSERT INTO "hitomi-history" VALUES(5039,'3409392','[Hirahira (Hirari)] Comitia Shucchou Henshuubu ni Itta Hi kara Tsuma no Yousu ga... 2-kan | 동인 이벤트의 출장 편집부에 간 날부터 아내의 상태가… 2 [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3409392/6373ea5675/',1750905769);
INSERT INTO "hitomi-history" VALUES(5040,'3409391','[Hirahira (Hirari)] Doujin Event no Shucchou Henshuubu ni Itta Hi kara Tsuma no Yousu ga... | 동인 이벤트의 출장 편집부에 간 날부터 아내의 상태가… [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409391/e3d494fbff/',1750905769);
INSERT INTO "hitomi-history" VALUES(5041,'3409390','(C102) [Ringoya (Alp)] Konoe no Kyuujitsu | 코노에의 휴일 (Love Live! Nijigasaki High School Idol Club) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409390/7af5501722/',1750905769);
INSERT INTO "hitomi-history" VALUES(5042,'3409384','[Yamamoto] Henkatsu! | 라해변! (Dragon Ball) [Korean] [Colorized] [Decensored]','Doujinshi','https://e-hentai.org/g/3409384/d0d6fd6c68/',1750905769);
INSERT INTO "hitomi-history" VALUES(5043,'3409381','[Yamamoto] Warui Aniki - Bulma ga Yuukai Sareta! | 나쁜 형님 - 부르마가 유괴당했다! (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409381/00432758e0/',1750905769);
INSERT INTO "hitomi-history" VALUES(5044,'3409380','[Yamamoto] NAM VS RANFAN | 나무 VS 란판 (Dragon Ball) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409380/cb2ee089a0/',1750905769);
INSERT INTO "hitomi-history" VALUES(5045,'3409377','[Yamamoto] 18-gou vs Kame Sennin | 18호 VS 거북선인 (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409377/ecc5509db1/',1750905769);
INSERT INTO "hitomi-history" VALUES(5046,'3409375','[Yamamoto] 18-gou to Mister Satan!! Seiteki Sentou! | 18호와 미스터 사탄!! 성적인 전투! (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409375/bae58ff367/',1750905769);
INSERT INTO "hitomi-history" VALUES(5047,'3409368','[Yamamoto] Bulma ga Chikyuu o Sukuu! | 부르마가 지구를 구한다! (Dragon Ball Super) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409368/91ff51a734/',1750905769);
INSERT INTO "hitomi-history" VALUES(5048,'3409359','[Yamamoto] No One Disobeys Beerus! | 누구도 비루스에게 거역할 수 없어! (Dragon Ball Super) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409359/c6bb74b184/',1750905769);
INSERT INTO "hitomi-history" VALUES(5049,'3409357','[Yamamoto] "Korai kara no Narawashi" Niizuma e no Ecchi na Itazura | "예로부터 내려온 전통" 새댁을 위한 짓궂은 장난 (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409357/da65629f91/',1750905769);
INSERT INTO "hitomi-history" VALUES(5050,'3409354','[Yamamoto] "Korai kara no Narawashi" Niizuma e no Ecchi na Itazura | "옛날로부터의 관례" 새댁에게로의 음란한 장난 (Dragon Ball Z) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3409354/b716551ca6/',1750905769);
INSERT INTO "hitomi-history" VALUES(5051,'3409330','[Nyuu Koubou (Papikoro)] 데스게임이니 어쩔 수 없잖아!? EX 1교시 싫은 게 아니다!? 아니 나는 딱히 싫지 않은 건','Doujinshi','https://e-hentai.org/g/3409330/9f4fe6da4b/',1750905769);
INSERT INTO "hitomi-history" VALUES(5052,'3409326','[Clesta (Cle Masahiro)] 여학교에 남자 한명이라서 교칙으로 성욕의 배출구가 되는 일상 4.5교시','Doujinshi','https://e-hentai.org/g/3409326/43d6077868/',1750905769);
INSERT INTO "hitomi-history" VALUES(5053,'3409223','[Kawahagitei] Senki Zecchou Chinpogear -Jinrui Zouka Keikaku- (Senki Zesshou Symphogear) [Korean] [incomplete]','Artist CG','https://e-hentai.org/g/3409223/12c66700d1/',1750905769);
INSERT INTO "hitomi-history" VALUES(5054,'3409177','(Puniket 50) [Echiko (Mokichi)] Chichi Haha Fuzai no Atashinchi (Atashinchi) [Korean]','Doujinshi','https://e-hentai.org/g/3409177/718c925d40/',1750905769);
INSERT INTO "hitomi-history" VALUES(5055,'3409126','[Otto] 어느 시골마을의 주부 연속 강간 사건｜Toaru inaka-mura no renzoku shufu re ◯ pu jiken','Doujinshi','https://e-hentai.org/g/3409126/b419b4fd01/',1750905769);
INSERT INTO "hitomi-history" VALUES(5056,'3409115','(C105) [Wafuu (Yoshiki)] Sensei, AV o Toru yo. | 선생님 AV를 찍자 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3409115/6d819f9f84/',1750905769);
INSERT INTO "hitomi-history" VALUES(5057,'3409110','[KENTO (KENTO OKAYAMA)] Downer Girl no Magao Acme! ~Futago Succubus no Shofuki Esthe~ | Downer Girl 정색 절정! ~쌍둥이 서큐버스의 시오후키 에스테~ [Korean]','Doujinshi','https://e-hentai.org/g/3409110/321f4fb780/',1750905769);
INSERT INTO "hitomi-history" VALUES(5058,'3409035','[Gankiya (Doctor Masube)] Uesugi Tsukasa wa Kaihatsu sa rete iru/fuyu | 우에스기 츠카사는 개발되고 있다/겨울 [Korean]','Doujinshi','https://e-hentai.org/g/3409035/be16de5b0b/',1750905769);
INSERT INTO "hitomi-history" VALUES(5059,'3409021','[Yurishima Shiro] Itoko to Ukkari Kankei o Mocchata OL-san | 사촌과 얼떨결에 관계를 가지고 만 OL씨 [Korean]','Doujinshi','https://e-hentai.org/g/3409021/2118dca7df/',1750905769);
INSERT INTO "hitomi-history" VALUES(5060,'3408976','[Takaman] Daily Sakusei Ninmu Kaga-san (Kantai Collection -KanColle-) [Korean]','Doujinshi','https://e-hentai.org/g/3408976/828e6965a8/',1750905769);
INSERT INTO "hitomi-history" VALUES(5061,'3408905','[Ishigaki Takashi] Ecchi na Onee-san-tachi ni Onsenyado de Hokakusareta Ken (Mahou Shoujo Lyrical Nanoha) [Korean] (ongoing)','Doujinshi','https://e-hentai.org/g/3408905/4f8a65b5c0/',1750905769);
INSERT INTO "hitomi-history" VALUES(5062,'3408904','[Ishigaki Takashi] Ecchi na Onee-san-tachi ni Beach de Gyakunansareta Ken (Mahou Shoujo Lyrical Nanoha) [Korean]','Doujinshi','https://e-hentai.org/g/3408904/08bb35136b/',1750905769);
INSERT INTO "hitomi-history" VALUES(5063,'3408877','[Tokupyon] 네토라레 SAO 1-27 + Censored ver (Sword Art Online) [Korean]','Artist CG','https://e-hentai.org/g/3408877/69bc0950ad/',1750905769);
INSERT INTO "hitomi-history" VALUES(5064,'3408867','(C87) [Mayoineko (Nakagami Takashi)] Untitled (Kemokko Lovers 5) [Korean]','Doujinshi','https://e-hentai.org/g/3408867/ef5e6f0261/',1750905769);
INSERT INTO "hitomi-history" VALUES(5065,'3408855','[Kikapu] Toga Rehabilitation (Boku no Hero Academia) [Korean]','Western','https://e-hentai.org/g/3408855/4271b56b70/',1750905769);
INSERT INTO "hitomi-history" VALUES(5066,'3408785','[Halcon] Senkan Mutsu ga Fighting Suit Kiserarete Akutoku Massage-Shi no Wana ni Ochiru no Maki [Korean]','Doujinshi','https://e-hentai.org/g/3408785/6f8cdd9700/',1750905769);
INSERT INTO "hitomi-history" VALUES(5067,'3408769','[Kusayarou] Dorei Zuma Mash no Sennou Kyoshiki (Fate Grand Order) [Korean]','Doujinshi','https://e-hentai.org/g/3408769/2068169202/',1750905769);
INSERT INTO "hitomi-history" VALUES(5068,'3408764','ABBB_2025.06 Reward','Doujinshi','https://e-hentai.org/g/3408764/461eae704d/',1750905769);
INSERT INTO "hitomi-history" VALUES(5069,'3408608','[Carn] Aoharu Snatch - Snatch a youth time | 아오하루 스내치 [Korean] [Digital]','Manga','https://e-hentai.org/g/3408608/98b4d62221/',1750905769);
INSERT INTO "hitomi-history" VALUES(5070,'3408470','[ie] Fanbox Omake | 팬박스 오마케 (2025.01~) [Korean] [Team Edge] [Digital]','Image Set','https://e-hentai.org/g/3408470/a469a0b930/',1750905769);
INSERT INTO "hitomi-history" VALUES(5071,'3408396','[Mimonel] Nakama ni Tanetsuke Kongan Sareru Kaihou Ou | 동료들에게 씨내리를 간청받는 해방왕♥ (Unicorn Overlord) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3408396/b659795ebf/',1750905769);
INSERT INTO "hitomi-history" VALUES(5072,'3408221','[Oninarasu] Asuna - Nishida | 아스나 - 니시다 1 (Sword Art Online) [Korean]','Doujinshi','https://e-hentai.org/g/3408221/87655f02c3/',1750905769);
INSERT INTO "hitomi-history" VALUES(5073,'3408103','(C105) [Navy Blue (Kagura Nanaki)] Firefly wa Caelus to ○○ Shitai!! | 반디는 카일루스와 OO하고 싶어!! (Honkai: Star Rail) [Korean]','Doujinshi','https://e-hentai.org/g/3408103/d145f4e819/',1750905769);
INSERT INTO "hitomi-history" VALUES(5074,'3407966','[MangMoongMing] Ganyu who can''t refuse (Genshin Impact) [Korean]','Artist CG','https://e-hentai.org/g/3407966/551817f5cc/',1750905769);
INSERT INTO "hitomi-history" VALUES(5075,'3407761','[Sasakama Box (Rumiya Isasa)] Eimi Danbou | 에이미 난방 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3407761/d7dbfa6b1b/',1750905769);
INSERT INTO "hitomi-history" VALUES(5076,'3407629','[Twitter] METEOR (@orrrca1701)','Image Set','https://e-hentai.org/g/3407629/4a2b5bd566/',1750905769);
INSERT INTO "hitomi-history" VALUES(5077,'3407615','[Daikyo Center (96 Shiki)] Senki Haiboku Tokushu Seiheki File 3 (Senki Zesshou Symphogear) [Korean]','Doujinshi','https://e-hentai.org/g/3407615/108e79a029/',1750905769);
INSERT INTO "hitomi-history" VALUES(5078,'3407581','[Natsume Ume] Shinjin JoshiAnno Songen Hakai Les Dorei Choukyou | 신인 여자 아나운서 존엄파괴 레즈노예 조교 [Korean]','Doujinshi','https://e-hentai.org/g/3407581/80f88c5535/',1750905769);
INSERT INTO "hitomi-history" VALUES(5079,'3407540','[Mozu] Uchuu no Naka ni Omae dake (COMIC Kairakuten BEAST 2025-07) [Korean] [팀 털난보리] [Digital]','Manga','https://e-hentai.org/g/3407540/68c3e10108/',1750905769);
INSERT INTO "hitomi-history" VALUES(5080,'3407434','[Manmosu Marimo] Boku Rachi Yushuna Academy-Sei [Korean] [LWND]','Doujinshi','https://e-hentai.org/g/3407434/904545e6ab/',1750905769);
INSERT INTO "hitomi-history" VALUES(5081,'3407407','[Mimonel] Kaitodan no 3P Date 2 | 괴도단의 3P 데이트 2 (Persona 5) [Korean]','Doujinshi','https://e-hentai.org/g/3407407/50a32c912c/',1750905769);
INSERT INTO "hitomi-history" VALUES(5082,'3407355','[Neromashin] FuyuComi Sakuka "Shinjin AV Joyuu Kujou Fumiko 56-sai, Rojou Dappun" | 『신인 AV 배우 쿠죠 후미코 56세, 노상탈분』 [Korean]','Doujinshi','https://e-hentai.org/g/3407355/98847d7886/',1750905769);
INSERT INTO "hitomi-history" VALUES(5083,'3407339','[Seibunkaken (Yanagida Fumita)] Kawaii Kawaii Kawaii | 귀여워어 귀여워어 귀여워어 [Korean]','Doujinshi','https://e-hentai.org/g/3407339/00b786fdbe/',1750905769);
INSERT INTO "hitomi-history" VALUES(5084,'3407324','[Zarameccho] Harem Yami Chiken Beit | 하렘 음지의 임상실험 알바 [Korean]','Doujinshi','https://e-hentai.org/g/3407324/8b16e4a394/',1750905769);
INSERT INTO "hitomi-history" VALUES(5085,'3407274','[Kuro Otoko] Yuutousei Joshi no Otoshikata | 우등생 여자를 타락시키는 법 [Korean]','Artist CG','https://e-hentai.org/g/3407274/08d1619926/',1750905769);
INSERT INTO "hitomi-history" VALUES(5086,'3407263','[Seiheki Master] 지금부터 적국병사의 매국세뇌를 시작하겠습니다','Doujinshi','https://e-hentai.org/g/3407263/d2fd853e7a/',1750905769);
INSERT INTO "hitomi-history" VALUES(5087,'3407258','[Zarameccho] 하렘 음지의 임상실험 알바','Doujinshi','https://e-hentai.org/g/3407258/ed5f364704/',1750905769);
INSERT INTO "hitomi-history" VALUES(5088,'3407255','[Seibunkaken (Yanagida Fumita)] Kawaii Kawaii Kawaii | 귀여워어 귀여워어 귀여워어 [Korean]','Doujinshi','https://e-hentai.org/g/3407255/de4ef4b937/',1750905769);
INSERT INTO "hitomi-history" VALUES(5089,'3407137','[Airu-ya (Airu)] Bakunyuu de Muchimuchina Miko-san ni Ahegao Oho-goe de Shiboritorareru [Korean]','Artist CG','https://e-hentai.org/g/3407137/916d415855/',1750905769);
INSERT INTO "hitomi-history" VALUES(5090,'3407107','[SigMart (SigMa)] Cool-kei Tenin-san o Omochikaeri Shichatta Hanashi 3 | 쿨한 점원을 테이크아웃 해버린 이야기 3 [Korean]','Doujinshi','https://e-hentai.org/g/3407107/1828946986/',1750905769);
INSERT INTO "hitomi-history" VALUES(5091,'3407011','[Doushia (Terasu MC)] Dorei Gazoku [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3407011/5f76190f99/',1750905769);
INSERT INTO "hitomi-history" VALUES(5092,'3406970','[Mimonel] Onna ni shite Hoshii Hyakka Ryouran Iinchou (Blue Archive) [Korean] [LWND]','Doujinshi','https://e-hentai.org/g/3406970/4747c80472/',1750905769);
INSERT INTO "hitomi-history" VALUES(5093,'3406899','[Nigiri Usagi] Noroi no Sei de MP ga Tarimasen!! | 저주 때문에 MP가 부족해요!! [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3406899/edabd716ef/',1750905769);
INSERT INTO "hitomi-history" VALUES(5094,'3406860','Briar and Sett''s Mom AV Tape ( 룬테라AV제작소 )','Doujinshi','https://e-hentai.org/g/3406860/78058e0498/',1750905769);
INSERT INTO "hitomi-history" VALUES(5095,'3413953','[しゃしゃ犬] しゃしゃ犬 pixiv 부분 한글판','Image Set','https://e-hentai.org/g/3413953/e6b4795b9b/',1750910862);
INSERT INTO "hitomi-history" VALUES(5121,'3420545','[Pirio Destruction (Piripun)] Yuri Tenshi to Ai no Oni | 백합 천사와 사랑의 오니 [Korean]','Doujinshi','https://e-hentai.org/g/3420545/7a9e9edcf2/',1751235567);
INSERT INTO "hitomi-history" VALUES(5122,'3420526','[laliberte] Motherly After [korean + textless]','Doujinshi','https://e-hentai.org/g/3420526/0e7c1a1873/',1751235567);
INSERT INTO "hitomi-history" VALUES(5123,'3420377','[Surumenium (Taniguchi Daisuke)] Kanojo no Imouto o Sexfriend ni Shita Hanashi | 여친의 여동생을 섹프로 삼은 이야기 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3420377/b2169ff0bf/',1751235567);
INSERT INTO "hitomi-history" VALUES(5124,'3420117','[Hokkebain! (Halcon)] Hama no Miko Ingoku ni Otsu 2 [Korean] [Ongoing]','Doujinshi','https://e-hentai.org/g/3420117/dbb61e088a/',1751235567);
INSERT INTO "hitomi-history" VALUES(5125,'3420116','[roborobocap] CEO and Bodyguard 01-158 [Korean] [ongoing]','Artist CG','https://e-hentai.org/g/3420116/6dc860e3fc/',1751235567);
INSERT INTO "hitomi-history" VALUES(5126,'3420110','[heppari] Loremaster Comics ch.1-28 [Korean][ongoing]','Non-H','https://e-hentai.org/g/3420110/2c4b282439/',1751235567);
INSERT INTO "hitomi-history" VALUES(5127,'3420010','[Pin-Point (Sansyoku Amido.)] Hamedoku Orikou JK Pet Ayane & Yuuna _Gakkou de Seishun _ Zenpen [Korean] [incomplete]','Artist CG','https://e-hentai.org/g/3420010/4890462eb5/',1751235567);
INSERT INTO "hitomi-history" VALUES(5128,'3419979','범해지는 최면5','Doujinshi','https://e-hentai.org/g/3419979/a8093f7667/',1751235567);
INSERT INTO "hitomi-history" VALUES(5129,'3419795','[Nishida Megane] Deka Chichi Kanojo Hatsujouchuu!! | 데카 가슴 그녀 발정중!! Ch. 1-6 [Korean] [뉴비라] [Digital]','Manga','https://e-hentai.org/g/3419795/d0a1cea486/',1751235567);
INSERT INTO "hitomi-history" VALUES(5130,'3419779','[poyeop] 24.10 Jean (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419779/8ad64592f3/',1751235567);
INSERT INTO "hitomi-history" VALUES(5131,'3419778','[poyeop] 23.11 Jean (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419778/f9679a5140/',1751235567);
INSERT INTO "hitomi-history" VALUES(5132,'3419777','[poyeop] 23.08 Jean (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419777/9decc2b653/',1751235567);
INSERT INTO "hitomi-history" VALUES(5133,'3419776','[poyeop] 23.05 Jean (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419776/96a79500d6/',1751235567);
INSERT INTO "hitomi-history" VALUES(5134,'3419745','[Poyeop] 2025.03 Shenhe (Genshin Impact) [ [Korean]','Doujinshi','https://e-hentai.org/g/3419745/d7820a32bd/',1751235567);
INSERT INTO "hitomi-history" VALUES(5135,'3419744','[Poyeop] 2024.03 Shenhe x Chongyun (Genshin Impact) [ [Korean]','Doujinshi','https://e-hentai.org/g/3419744/1e5a80bb7d/',1751235567);
INSERT INTO "hitomi-history" VALUES(5136,'3419743','[Poyeop] 2021.11 Shenhe (Genshin Impact) [ [Korean]','Doujinshi','https://e-hentai.org/g/3419743/c5bbca83a9/',1751235567);
INSERT INTO "hitomi-history" VALUES(5137,'3419742','[Sakuragi Yomi] Yuudachi no Sasoi [Korean] [LWND]','Doujinshi','https://e-hentai.org/g/3419742/ead9fa95c1/',1751235567);
INSERT INTO "hitomi-history" VALUES(5138,'3419718','[Poyeop] 2025.05 Varesa (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419718/73e3e99abf/',1751235567);
INSERT INTO "hitomi-history" VALUES(5139,'3419716','[Poyeop] 2025.06  Escoffier (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419716/af9609a0f7/',1751235567);
INSERT INTO "hitomi-history" VALUES(5140,'3419714','[Poyeop] 2024.09 Ganyu''s Milk (Genshin Impact)  [Korean]','Doujinshi','https://e-hentai.org/g/3419714/ea6942e24f/',1751235567);
INSERT INTO "hitomi-history" VALUES(5141,'3419708','[Poyeop] 2025.03 Nilou (Genshin Impact)  [Korean]','Doujinshi','https://e-hentai.org/g/3419708/b8a655f1a6/',1751235567);
INSERT INTO "hitomi-history" VALUES(5142,'3419707','[Poyeop] 2024.04 Nilou (Genshin Impact)  [Korean]','Doujinshi','https://e-hentai.org/g/3419707/146d90204d/',1751235567);
INSERT INTO "hitomi-history" VALUES(5143,'3419703','[Poyeop] 2024.05 Ayaka (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419703/e981eeb8f1/',1751235567);
INSERT INTO "hitomi-history" VALUES(5144,'3419692','[poyeop] 2023.05 Raiden x Gorou (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419692/636184315e/',1751235567);
INSERT INTO "hitomi-history" VALUES(5145,'3419688','[Poyeop] 2025.04 Raiden (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419688/511b715eba/',1751235567);
INSERT INTO "hitomi-history" VALUES(5146,'3419683','[poyeop] 2024.02 HuTao (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419683/8bafad2eba/',1751235567);
INSERT INTO "hitomi-history" VALUES(5147,'3419682','[Poyeop] 2025.01 Lantern Rite hutao (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3419682/8e0a9a76cc/',1751235567);
INSERT INTO "hitomi-history" VALUES(5148,'3419655','[Poyeop] 교배실습 1~8 [Korean]','Doujinshi','https://e-hentai.org/g/3419655/5d4bcc4381/',1751235567);
INSERT INTO "hitomi-history" VALUES(5149,'3419581','[Yurishima Shiro] Zoku·Class ni Hitori dakeno Joshi | 속·반에서 하나뿐인 여자 [Korean]','Doujinshi','https://e-hentai.org/g/3419581/3e4496e02b/',1751235567);
INSERT INTO "hitomi-history" VALUES(5150,'3419529','[Mimonel] [Nichijou-kai] Harem na Campus Life [Korean]','Doujinshi','https://e-hentai.org/g/3419529/3a8e1cee20/',1751235567);
INSERT INTO "hitomi-history" VALUES(5151,'3419528','[Mimonel] W Succubus to Hatsujou All Night H [Korean]','Doujinshi','https://e-hentai.org/g/3419528/e59c571013/',1751235567);
INSERT INTO "hitomi-history" VALUES(5152,'3419389','[Minagi KOH] Ashiyu Taiken Ni Youkoso 1~2 | Welcome to the Footbath Experience [Korean]','Artist CG','https://e-hentai.org/g/3419389/35582cc8d3/',1751235567);
INSERT INTO "hitomi-history" VALUES(5153,'3419373','[Naruho-dou (Naruhodo)] G3.5 + Extra (Naruto) [Korean]','Doujinshi','https://e-hentai.org/g/3419373/f16b3134db/',1751235567);
INSERT INTO "hitomi-history" VALUES(5154,'3419363','[Pixiv] Nyong_Nyong (14120806)','Image Set','https://e-hentai.org/g/3419363/bcab514d82/',1751235567);
INSERT INTO "hitomi-history" VALUES(5155,'3419319','[Fukurou] Muttsuri Sukebe no Gyaru Debut! (Comic Kaien VOL.19) [Digital] [Korean]','Manga','https://e-hentai.org/g/3419319/cd18cc162c/',1751235567);
INSERT INTO "hitomi-history" VALUES(5156,'3419317','[Hitsuji Kikaku (Muneshiro)] Osucollab 4 Seifuku Hen (Hakui Koyori, Sakamata Chloe) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419317/40ab22dcf9/',1751235567);
INSERT INTO "hitomi-history" VALUES(5157,'3419316','[Hitsuji Kikaku (Muneshiro)] Osucollab 3 (Hakui Koyori, Sakamata Chloe) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419316/b304e9e1ff/',1751235567);
INSERT INTO "hitomi-history" VALUES(5158,'3419315','[Hitsuji Kikaku (Muneshiro)] Osucollab 2 (Hakui Koyori, Sakamata Chloe) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419315/2f48d43c52/',1751235567);
INSERT INTO "hitomi-history" VALUES(5159,'3419314','[OVERKILL (Bita)] Yuusha Party kara Seijo o Sukutta no wa Maou-sama deshita [Korean]','Doujinshi','https://e-hentai.org/g/3419314/a9d7856aad/',1751235567);
INSERT INTO "hitomi-history" VALUES(5160,'3419313','[Beans Mame (Mochiji)] Naraku no Hyouka Reitetsu OL Kankin Ryoujoku | 나락의 빙화 냉철 OL 감금 능욕 [Korean] [마법우엉] [Digital]','Doujinshi','https://e-hentai.org/g/3419313/846edcb942/',1751235567);
INSERT INTO "hitomi-history" VALUES(5161,'3419312','[Beans Mame (Mochiji)] Kabeshiri Usagi Boukensha, Kusuri de Kyousei Hatsujou!? [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419312/cef350a341/',1751235567);
INSERT INTO "hitomi-history" VALUES(5162,'3419310','[Paseli-ya-san (Hachimine Basil) Maid wa Daisuki na Goshujin-sama ni Shitsuke Sareru [Korean]','Doujinshi','https://e-hentai.org/g/3419310/3ef9676104/',1751235567);
INSERT INTO "hitomi-history" VALUES(5163,'3419307','[Nyala Ponga (Sekai Saisoku no Panda)] Suizoki Nagiko-san ga Toshishita Joushi to Master no Netorase Shumi ni Tsukiau Hon (Fate/Grand Order) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419307/e4883a5922/',1751235567);
INSERT INTO "hitomi-history" VALUES(5164,'3419306','[Nigiri Usagi] Sodatekata o Machigaeta Majo [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3419306/f243dd41cd/',1751235567);
INSERT INTO "hitomi-history" VALUES(5165,'3419305','[Nayuta no Hakobune (Shishikura Sendou)] Danchou nante Daikirai desu! [Korean]','Doujinshi','https://e-hentai.org/g/3419305/80c532b413/',1751235567);
INSERT INTO "hitomi-history" VALUES(5166,'3419304','[Nagiyamasugi (Nagiyama)] Precure Ryoujoku 17 Mayu (Wonderful PreCure!) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3419304/b05bc3d4d7/',1751235568);
INSERT INTO "hitomi-history" VALUES(5167,'3419303','[Tsubame] Futayuri - Muchi na Ojou-sama to Futanari Musume [Korean]','Doujinshi','https://e-hentai.org/g/3419303/2e33ae4e94/',1751235568);
INSERT INTO "hitomi-history" VALUES(5168,'3419302','[Tsukuyomi] Aimai na Bokura 3 Kanojo wa Tabun, Korekara Mechakucha Sex Suru [Korean]','Doujinshi','https://e-hentai.org/g/3419302/5d028b43d9/',1751235568);
INSERT INTO "hitomi-history" VALUES(5169,'3419133','[Hiero] Haru Kurabe 3 | 봄날의 경쟁 3 [Korean]','Doujinshi','https://e-hentai.org/g/3419133/b2f6bdfcb4/',1751235568);
INSERT INTO "hitomi-history" VALUES(5170,'3419130','[Hiero] Haru Kurabe 2 | 봄날의 경쟁 2 [Korean]','Doujinshi','https://e-hentai.org/g/3419130/2a69b9b508/',1751235568);
INSERT INTO "hitomi-history" VALUES(5171,'3419120','[Izure] Katte ni Sumitsuiteru InCha Yuurei no Karada o Suki Katte suru Hanashi 3 | 멋대로 눌러앉은 아싸 유령의 몸을 막 쓰는 이야기 3 [Korean]','Doujinshi','https://e-hentai.org/g/3419120/c0579bd2b7/',1751235568);
INSERT INTO "hitomi-history" VALUES(5172,'3419068','[Gin Eiji] Hahaoya to Tannin no Sensei ga Sex shite Shimaimashita (Korean)','Doujinshi','https://e-hentai.org/g/3419068/dde2f06c7f/',1751235568);
INSERT INTO "hitomi-history" VALUES(5173,'3419054','[Ookami Shoujo Yuugi Dan (Mukoujima Tenro)] Onna Kenshi Couloette ~Chijou to Ryoujoku no Boukentan~ | 여검사 클로에 ~치정과 능욕의 모험담~ [Korean]','Artist CG','https://e-hentai.org/g/3419054/cc5b7015f6/',1751235568);
INSERT INTO "hitomi-history" VALUES(5174,'3418522','[Asanine Luno] Shirotsumekusa no Nemuru Tokoro wa - Where the white clover sleeps | 클로버가 잠든 곳 (COMIC X-EROS #124) [Korean] [Digital]','Manga','https://e-hentai.org/g/3418522/edf717b7b2/',1751235568);
INSERT INTO "hitomi-history" VALUES(5175,'3418468','[ie] 3 Gal | 3갸루 [Korean] [Team Edge] [Ongoing]','Doujinshi','https://e-hentai.org/g/3418468/185f39c617/',1751235568);
INSERT INTO "hitomi-history" VALUES(5176,'3418450','[Sevengar] 코스어 시리즈 1~9편 통합 [Korean]','Doujinshi','https://e-hentai.org/g/3418450/c25453d2d1/',1751235568);
INSERT INTO "hitomi-history" VALUES(5177,'3418418','[Sevengar] Jakusho Bakunyu Reiya, Kareshi Ni Naisho No Fan KanshaSai Movie | 약소 폭유 코스어, 남친에게 비밀로 팬 감사제 무비 [Korean]','Doujinshi','https://e-hentai.org/g/3418418/b6c0b4426e/',1751235568);
INSERT INTO "hitomi-history" VALUES(5178,'3418413','Wachiwo 보추 쇼타 방귀 냄세 패티쉬 와치오 작가님 번역 모음집','Image Set','https://e-hentai.org/g/3418413/2621ece96a/',1751235568);
INSERT INTO "hitomi-history" VALUES(5179,'3418375','[Suimitsutou Koubou (Momo no Suidousui)] Wakarase Gishimai | 여동생 참교육  [Korean] [팀☆데레마스] [Digital]','Doujinshi','https://e-hentai.org/g/3418375/64d090439c/',1751235568);
INSERT INTO "hitomi-history" VALUES(5180,'3418268','[Choipiro] Yuka Undou after (COMIC Kairakuten BEAST 2025-07) [Korean] [팀 털난보리] [Digital]','Manga','https://e-hentai.org/g/3418268/973402a007/',1751235568);
INSERT INTO "hitomi-history" VALUES(5181,'3418160','[Haruharudo] Kaneda wa nani mo Warukunai Vol.3 | 카네다는 나쁘지 않아 Vol.3 [Korean]','Doujinshi','https://e-hentai.org/g/3418160/4b1f4e25eb/',1751235568);
INSERT INTO "hitomi-history" VALUES(5182,'3418158','[Eco Heeky] Minori-chan ~Kareshi ga Inai to Dame Nandesu~ (COMIC X-EROS #107) [Korean] [Digital]','Manga','https://e-hentai.org/g/3418158/2f454978ea/',1751235568);
INSERT INTO "hitomi-history" VALUES(5183,'3418155','[Ookiyuzuki] Genkini NTR Houkoku! | 기운차게 NTR 보고! [Korean]','Doujinshi','https://e-hentai.org/g/3418155/10b2d7eb51/',1751235568);
INSERT INTO "hitomi-history" VALUES(5184,'3418152','[Hyouuma] Yumemi Kokomi Kouhen Part 2 + Final [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3418152/d6f0954b35/',1751235568);
INSERT INTO "hitomi-history" VALUES(5185,'3418150','[Sanuki] 소니아 NTR [Korean]','Image Set','https://e-hentai.org/g/3418150/46266c005f/',1751235568);
INSERT INTO "hitomi-history" VALUES(5186,'3418149','[Alp] 0504 (Sword Art Online) [Korean]','Artist CG','https://e-hentai.org/g/3418149/71f2449d6d/',1751235568);
INSERT INTO "hitomi-history" VALUES(5187,'3418148','[Giga] Tosaka Rin BBC Netorare + Tosaka BBC 2 | 토오사카 린 BBC 네토라레 (Fate/stay night) [Korean]','Doujinshi','https://e-hentai.org/g/3418148/b02990ef65/',1751235568);
INSERT INTO "hitomi-history" VALUES(5188,'3418146','(C104) [Brio (Puyocha)] Puyo Channel Vol.05 (Kono Subarashii Sekai ni Syukufuku o!) [Korean]','Doujinshi','https://e-hentai.org/g/3418146/494161eddb/',1751235568);
INSERT INTO "hitomi-history" VALUES(5189,'3418145','[Mr.way] Emoi Downer na Funiki no Tonari no Onee-san wa Boku no Tomodachi no Mesu | 옆집 누나는 내 친구의 암컷 [Korean]','Doujinshi','https://e-hentai.org/g/3418145/11a89d0459/',1751235568);
INSERT INTO "hitomi-history" VALUES(5190,'3418144','[Mr.way] Downer Onee-san to Tsukiatte Ichaicha suru dake no Hanashi (NTR?) | 다우너 누나와 사귀며 속삭이는 이야기 (NTR?) [Korean]','Doujinshi','https://e-hentai.org/g/3418144/367a11188b/',1751235568);
INSERT INTO "hitomi-history" VALUES(5191,'3418140','SORA 작가 모음','Western','https://e-hentai.org/g/3418140/0403ed8735/',1751235568);
INSERT INTO "hitomi-history" VALUES(5192,'3418138','[KennyComix (TheDirtyMonkey)] Mommy''s Escapades | 엄마의 일탈 [Korean]','Western','https://e-hentai.org/g/3418138/2cf5836b54/',1751235568);
INSERT INTO "hitomi-history" VALUES(5193,'3418136','[NotEnoughMilk] Mom Deals With My Bully | 엄마는 학교폭력 해결사 [Korean]','Western','https://e-hentai.org/g/3418136/adcdd86a34/',1751235568);
INSERT INTO "hitomi-history" VALUES(5194,'3418129','(C102) [Tamago no Kara (Shiroo)] Buri sai no Ochi Hime | 브리짓 서클의 타락한 공주 + etc (Buri sai no Ochi Hime) (Guilty Gear) [Korean]','Doujinshi','https://e-hentai.org/g/3418129/b83347fa12/',1751235568);
INSERT INTO "hitomi-history" VALUES(5195,'3418128','[Saigado] Shukujo Monologue Fake mom | 숙녀 모노로그 Fake mom [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3418128/291f2146c9/',1751235568);
INSERT INTO "hitomi-history" VALUES(5196,'3418111','[Meganei] Shishunki no Obenkyou | 사춘기의 공부 [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3418111/b961517682/',1751235568);
INSERT INTO "hitomi-history" VALUES(5197,'3418107','[Eonsang] Zhaohui (Girls'' Frontline)','Doujinshi','https://e-hentai.org/g/3418107/832eff108a/',1751235568);
INSERT INTO "hitomi-history" VALUES(5198,'3418095','[Yobieki Seisakusho] Kanojo no Sentaku Kouhen | 그녀의 선택 후편 [Korean]','Doujinshi','https://e-hentai.org/g/3418095/6a82ea3711/',1751235568);
INSERT INTO "hitomi-history" VALUES(5199,'3418074','[Gohyakuen Chokinbako] Nigerarenai Ninshin - Dasarereba Haramu - | 도망칠 수 없는 임신 -사정당하면 임신한다- [Korean]','Artist CG','https://e-hentai.org/g/3418074/984e9f251a/',1751235568);
INSERT INTO "hitomi-history" VALUES(5200,'3418017','[Charu] Roshutsu Shoujo Yuugi Kan ~Akira Etsuraku Ochi Hen~','Doujinshi','https://e-hentai.org/g/3418017/1a31a551b0/',1751235568);
INSERT INTO "hitomi-history" VALUES(5201,'3417974','[YUE C] 空のNTR ファンタジー-雷電将軍 編 [1.3] [Korean]','Doujinshi','https://e-hentai.org/g/3417974/af34a99113/',1751235568);
INSERT INTO "hitomi-history" VALUES(5202,'3417945','[ttp] Hitsuji no Fuwatoro Milk Body (Genshin Impact) [Korean]','Artist CG','https://e-hentai.org/g/3417945/143ab13287/',1751235568);
INSERT INTO "hitomi-history" VALUES(5203,'3417905','(C102) [Darabuchidou (Darabuchi)] PROSTITUTION REROAD (Persona 3) [Korean]','Doujinshi','https://e-hentai.org/g/3417905/a741c82b09/',1751235568);
INSERT INTO "hitomi-history" VALUES(5204,'3417901','[Kumakiti] 과거작 대형 사이즈 유카릿치 만화 | Yukarecchi Manga, Past Drawings, Large Size','Doujinshi','https://e-hentai.org/g/3417901/823166cc97/',1751235568);
INSERT INTO "hitomi-history" VALUES(5205,'3417899','[Ninokoya (Ninoko)] Elf ni Inmon o Tsukeru Hon LEVEL:8 | 엘프에게 음문을 다는 책 LEVEL:8 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3417899/07bc107f2b/',1751235568);
INSERT INTO "hitomi-history" VALUES(5206,'3417831','[Denki Neko (Toku)] Kougakubu no Tanuhara san | 공학부의 타누하라 양 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3417831/e4a6b8366d/',1751235568);
INSERT INTO "hitomi-history" VALUES(5207,'3417783','[Izumo Gasshuukoku (Momomo Gasshuukoku)] Atama no Warui Futanari Mangasyu 5 Honme | 무뇌 후타나리 만화집 5번째 [Korean]','Doujinshi','https://e-hentai.org/g/3417783/846ce573a6/',1751235568);
INSERT INTO "hitomi-history" VALUES(5208,'3417716','[uingssi] Sotsugyou Shita Kara, Karada wa Motte Ikimasu. | 졸업했으니 몸은 가져갈게요. (Minato Aqua) [Korean]','Doujinshi','https://e-hentai.org/g/3417716/00ab08dcd2/',1751235568);
INSERT INTO "hitomi-history" VALUES(5209,'3417708','[uingssi] 냥냥 펫스바루 [Korean]','Doujinshi','https://e-hentai.org/g/3417708/39059b214e/',1751235568);
INSERT INTO "hitomi-history" VALUES(5210,'3417594','[Bisho Oji] Sasoi mizu ni Nurete | 마중물에 젖어서 (COMIC Kairakuten 2025-08) [Korean] [Team Edge] [Digital]','Manga','https://e-hentai.org/g/3417594/5bb4163c54/',1751235568);
INSERT INTO "hitomi-history" VALUES(5211,'3417290','[Luxsumildo] 한사랑TV 논란의 스트리머들 [Korean]','Artist CG','https://e-hentai.org/g/3417290/8c282b7064/',1751235569);
INSERT INTO "hitomi-history" VALUES(5212,'3417266','[LUXsumildo] 정글쥬스 - 박희진 교배 출산','Doujinshi','https://e-hentai.org/g/3417266/e06e5abe1b/',1751235569);
INSERT INTO "hitomi-history" VALUES(5213,'3417265','[LUXsumildo] Mabinogi Mobile','Doujinshi','https://e-hentai.org/g/3417265/a230a4c983/',1751235569);
INSERT INTO "hitomi-history" VALUES(5214,'3417262','[LUXsumildo] 연애혁명 ~이경우 흑화루트~ ③','Doujinshi','https://e-hentai.org/g/3417262/5d9aa1da8b/',1751235569);
INSERT INTO "hitomi-history" VALUES(5215,'3417261','[LUXsumildo] 연애혁명 ~이경우 흑화루트~ ②','Doujinshi','https://e-hentai.org/g/3417261/d71ef3f5a7/',1751235569);
INSERT INTO "hitomi-history" VALUES(5216,'3417217','[Mizore] Kaji Daikou no Mizutani San | 가사 대행의 미즈타니 씨 (COMIC Kairakuten 2025-08) [Korean] [Team Edge] [Digital]','Manga','https://e-hentai.org/g/3417217/5a2ef3e2af/',1751235569);
INSERT INTO "hitomi-history" VALUES(5217,'3417200','[DameDungeon (Dame Neko)] Haiboku no Senotome-tachi | 패배의 여전사들 [Korean]','Artist CG','https://e-hentai.org/g/3417200/bb63092489/',1751235569);
INSERT INTO "hitomi-history" VALUES(5218,'3417198','[Misaki (Etsudo an)] Boku dake no Yuki Ane | 나만의 유키 누나 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3417198/d5d329ad73/',1751235569);
INSERT INTO "hitomi-history" VALUES(5219,'3417114','[Nureshidare] Zetsurin Musuko ga Dosukebe Body Haha o Dosukebe ishou ni Kikazarasete do Inran Koubishimakuri | 정력절륜한 아들이 초음란 몸매의 엄마에게 초음란 의상을 입히고 마구마구 음란교미 [Korean] [팀 숙녀]','Doujinshi','https://e-hentai.org/g/3417114/e4b7f5789f/',1751235569);
INSERT INTO "hitomi-history" VALUES(5220,'3417113','[NCP (big.g)] Haha Ane Chichi de Milk Mamire no Dorodoro Harem ~Gibo to Gishi no Bonyuu ni Oboreru Mainichi~ | 엄마 누나의 젖으로 밀크 범벅인 질척질척 하렘 ~의붓엄마와 의붓누나의 모유에 빠지는 매일~ [Korean] [팀 숙녀]','Doujinshi','https://e-hentai.org/g/3417113/151873730b/',1751235569);
INSERT INTO "hitomi-history" VALUES(5221,'3417068','[Hiero] Haru Kurabe 6 | 봄날의 경쟁 6 [Korean]','Doujinshi','https://e-hentai.org/g/3417068/f199806cdb/',1751235569);
INSERT INTO "hitomi-history" VALUES(5222,'3417067','[Hiero] Haru Kurabe 4 | 봄날의 경쟁 4 [Korean]','Doujinshi','https://e-hentai.org/g/3417067/c162512a15/',1751235569);
INSERT INTO "hitomi-history" VALUES(5223,'3417063','[Hiero] Haru Kurabe 5 | 봄날의 경쟁 5 [Korean]','Doujinshi','https://e-hentai.org/g/3417063/85a9651c38/',1751235569);
INSERT INTO "hitomi-history" VALUES(5224,'3417062','[Hiero] Haru Kurabe 4.5 | 봄날의 경쟁 4.5 [Korean]','Doujinshi','https://e-hentai.org/g/3417062/9f827a5e93/',1751235569);
INSERT INTO "hitomi-history" VALUES(5225,'3416988','말나홀 만화','Doujinshi','https://e-hentai.org/g/3416988/cde868a5ea/',1751235569);
INSERT INTO "hitomi-history" VALUES(5226,'3416947','[Kurihara Kenshirou] SNS de Otoko dato Omotteita Aite ga Buaisou dakedo Sukihoudai Yarasetekureru Se no Takai Onna datta Hanashi | SNS에서 남자인 줄 알았던 상대가 무뚝뚝하지만 마음대로 하게 해주는 키 큰 여자였던 이야기 [Korean]','Doujinshi','https://e-hentai.org/g/3416947/32576a451a/',1751235569);
INSERT INTO "hitomi-history" VALUES(5227,'3416838','[Tokkuni Tokku (Shamidou Maichimonji)] Tsuboi Maki (42) wa 2-fun-go Musuko to Oyako de Sex o Suru | 츠보이 마키(42) 2분 뒤 아들이랑 모자지간 섹스를 한다 [Korean]','Doujinshi','https://e-hentai.org/g/3416838/eb267d9531/',1751235569);
INSERT INTO "hitomi-history" VALUES(5228,'3416829','[Nijiiro Kanata] Seishun no Ranman Osage | 청춘의 난만 댕기머리 (Ranma 1/2) [Korean]','Doujinshi','https://e-hentai.org/g/3416829/1d5f13865d/',1751235569);
INSERT INTO "hitomi-history" VALUES(5229,'3416816','[Gankiya (Doctor Masube)] Uesugi Tsukasa wa Kaihatsu sareteiru / Fuyu | 우에스기 츠카사는 개발되고 있다/겨울 [Korean]','Doujinshi','https://e-hentai.org/g/3416816/dba7157121/',1751235569);
INSERT INTO "hitomi-history" VALUES(5230,'3416684','[Bifidus] Mesuinu no Yoru | 암캐의 밤 (Watashi wa Meinu) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3416684/dd01e875de/',1751235569);
INSERT INTO "hitomi-history" VALUES(5231,'3416636','[Pixiv] Physisyoon (18925210)','Image Set','https://e-hentai.org/g/3416636/6c740b16bf/',1751235569);
INSERT INTO "hitomi-history" VALUES(5232,'3416601','[DevilHS] Legend of Queen Opala #3-3 - In the Shadow of Anubis [Korean_ai]','Western','https://e-hentai.org/g/3416601/4142e8ddb6/',1751235569);
INSERT INTO "hitomi-history" VALUES(5233,'3416520','[Toushiki Yubune] Suki Kurabe (COMIC Kairakuten 2025-07) [Korean] [팀 털난보리] [Digital]','Manga','https://e-hentai.org/g/3416520/5691e8cb76/',1751235569);
INSERT INTO "hitomi-history" VALUES(5234,'3416498','[KIE] Castorice (Honkai: Star Rail) [Decensored]','Artist CG','https://e-hentai.org/g/3416498/fb1b5bb8cb/',1751235569);
INSERT INTO "hitomi-history" VALUES(5235,'3416171','[Pirokobo (Piro)] Kagaku Junbishitsu no Tsumi 3 | 화학준비실의 죄 3 [Korean]','Doujinshi','https://e-hentai.org/g/3416171/b9401602b9/',1751235569);
INSERT INTO "hitomi-history" VALUES(5236,'3416000','[Brother Pierrot] Imouto no Naka Ch. 1-3 [Korean] [Digital]','Manga','https://e-hentai.org/g/3416000/d6e373c9b8/',1751235569);
INSERT INTO "hitomi-history" VALUES(5237,'3415980','[Doji Ro] InCha Doushi no Tsukiau Chokuzen ga Ichiban Eroiyo ne #3 | 아싸끼리 사귀기 직전이 제일 야하다 #3 (COMIC Kairakuten 2025-08) [Korean] [Team Edge] [Digital]','Manga','https://e-hentai.org/g/3415980/1fdb23b7f0/',1751235569);
INSERT INTO "hitomi-history" VALUES(5238,'3415952','[Kurukuru] Baka Kanojo ga Hamedori Hamatte Baka-Sex wo Toukou Suru Hanashi | 바보 여친이 셀카 촬영에 빠져 바보 섹스를 업로드하는 이야기 [Korean]','Manga','https://e-hentai.org/g/3415952/246bde0250/',1751235569);
INSERT INTO "hitomi-history" VALUES(5239,'3415209','[byeodi] 노아를 따먹고 유우카도 따먹고 리오도 따먹고 코유키는 안 따먹고 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3415209/5bf854019e/',1751235569);
INSERT INTO "hitomi-history" VALUES(5240,'3415112','[Nacchuushou (Amazon)] Kazami Yuuka 29-sai OL Rakugaki (Touhou Project) [Korean] [실루엣21]','Artist CG','https://e-hentai.org/g/3415112/d4f7edd43e/',1751235569);
INSERT INTO "hitomi-history" VALUES(5241,'3415040','(C71) [Junpuumanpandou (Hida Tatsuo)] Noble Maiden | 노블 메이든 (Persona 3) [Korean]','Doujinshi','https://e-hentai.org/g/3415040/a5ad6c76f0/',1751235569);
INSERT INTO "hitomi-history" VALUES(5242,'3415038','[Homunculus] Cover Girl''s Episode (COMIC Kairakuten 2025-08) [Korean] [Team Edge] [Digital]','Manga','https://e-hentai.org/g/3415038/51c03037c2/',1751235569);
INSERT INTO "hitomi-history" VALUES(5243,'3414957','[Takuru] Uzaki-sanchi no Oku-san (Uzaki-chan wa Asobitai!) [Korean] [실루엣21]','Doujinshi','https://e-hentai.org/g/3414957/752db21ab9/',1751235569);
INSERT INTO "hitomi-history" VALUES(5244,'3414826','[Chisakiss (Wakuta Chisaki)] Osananajimi Gal ni Suki to Ienai Inkya na Ore | 소꿉친구 갸루에게 고백 못 하는 아싸인 나 전편 [Korean] [Team Edge]','Doujinshi','https://e-hentai.org/g/3414826/d58d0aa63a/',1751235569);
INSERT INTO "hitomi-history" VALUES(5245,'3414783','[Bonnoudou (Shikuta Maru)] Hen na Uranaishi no Hen na Omichibiki | 수상한 점술사의 수상한 전도 [Korean]','Artist CG','https://e-hentai.org/g/3414783/20c285011d/',1751235569);
INSERT INTO "hitomi-history" VALUES(5246,'3734920','[seikonjirushi (Sucota)] Niyaniya Kao ga Torokeru made Pakopako suru Hanashi | 비웃던 얼굴이 녹아내릴 때까지 박아대는 이야기 (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3734920/808accd827/',1768257294);
INSERT INTO "hitomi-history" VALUES(5247,'3734838','[Shiina] Noraneko Shoujo to no Kurashikata | 들고양이 소녀와 생활하는 법 22~24화 (Ongoing)','Manga','https://e-hentai.org/g/3734838/26b78affba/',1768257294);
INSERT INTO "hitomi-history" VALUES(5248,'3734816','[Smile Foran Company. (Minegami Aya)] Migawari 2 ~Ochita Kyonyuu Gal ni Kurikaesu Wana~ | 대역 2 ~망가진 거유 갸루에게 다시 반복되는 함정~ [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3734816/1168e5e85c/',1768257294);
INSERT INTO "hitomi-history" VALUES(5249,'3734812','[Smile Foran Company. (Minegami Aya)] Migawari ~Tsuyoki na Kyonyuu Gal ga Ochiru Wana~ | 대역 ~건방진 거유 갸루가 망가지는 함정~ [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3734812/eb60a6ecc3/',1768257294);
INSERT INTO "hitomi-history" VALUES(5250,'3734687','[nul_Neverland (Navier Haruka 2T)] Ofupako dou desu ka? | 오프파코 어떠신가요? [Korean]','Doujinshi','https://e-hentai.org/g/3734687/e6e304268f/',1768257294);
INSERT INTO "hitomi-history" VALUES(5251,'3734552','[Uncow] Chinpo Man ep.1.5 | 자지맨 번외편 1화','Doujinshi','https://e-hentai.org/g/3734552/cd26fab06b/',1768257294);
INSERT INTO "hitomi-history" VALUES(5252,'3734541','[Inchikidou (Kemonono★)] Ponko Chance  | 퐁코짱 입니다 [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3734541/f4f973b6df/',1768257294);
INSERT INTO "hitomi-history" VALUES(5253,'3734517','[Koppun (Hone)] Ima made no Kareshi de Ikenakatta, Ima made no Kanojo o Ikasesugita, Osananajimi Doushi no Shinken Sex Shoubu!! | 지금까지 남친으로 가지 못한, 지금까지 여친을 너무 가게 한, 소꿉친구끼리의 진지한 섹스 승부!! [Korean]','Doujinshi','https://e-hentai.org/g/3734517/155cd7356c/',1768257294);
INSERT INTO "hitomi-history" VALUES(5254,'3734466','[Dogyaddo Naru Yanke (Naru)] Gaman Dekinaku natta Mesu ni Kateru Wake nai desho 2 | 참을 수 없게된 암컷에게 이길 수 있을리 없잖아 2 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3734466/524893761f/',1768257294);
INSERT INTO "hitomi-history" VALUES(5255,'3734461','[Nori5rou] Imaizumin-chi wa Douyara Gal no Tamariba ni Natteru Rashii 7 | 이마이즈미네 집은 아무래도 갸루의 아지트가 된 모양이다 7 [Korean]','Doujinshi','https://e-hentai.org/g/3734461/942962c805/',1768257294);
INSERT INTO "hitomi-history" VALUES(5256,'3734404','(C107) [Anmitsuyomogitei (Michiking)] Succubus Seitokai Shiko Shiko Shikkoubu 3.5 -Katsudou Kiroku- | 서큐버스 성도회 문질문질 집행부 3.5 [Korean]','Doujinshi','https://e-hentai.org/g/3734404/abeedc75ad/',1768257294);
INSERT INTO "hitomi-history" VALUES(5257,'3734397','[Sora Paprika] Zecchou Kenchi Appli ~Nariyamanai Netorare Tsuuchi~ | 절정 감지 어플 ~그치지 않는 네토라레 알림~ [Korean]','Doujinshi','https://e-hentai.org/g/3734397/18010c94db/',1768257294);
INSERT INTO "hitomi-history" VALUES(5258,'3734385','[Akagai (Mine Thrower)] Izuna-chan no Kareshi o Izuna-kun ni Shite Sensei no Kanojo ni Shite Ageru Gainen | 이즈나 쨩의 남자친구를 이즈나 군으로 만들어 선생님의 여자친구로 만드는 그런 개념 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3734385/4a1b6d2b10/',1768257294);
INSERT INTO "hitomi-history" VALUES(5259,'3734339','[T.cop (Natsuki Kiyohito)] Jimiko to Ichinichijuu Sex | 평범녀랑 하루 종일 섹스 2 [Korean] [스마일 슬라임] [Digital]','Doujinshi','https://e-hentai.org/g/3734339/d4525e2044/',1768257294);
INSERT INTO "hitomi-history" VALUES(5260,'3734338','코믹 메이플스토리 수학도둑 1-10권','Non-H','https://e-hentai.org/g/3734338/09e944d7b5/',1768257294);
INSERT INTO "hitomi-history" VALUES(5261,'3733409','[Juna Juna Juice] Naomi-san wa Ore no SeFri | 나오미 씨는 내 섹스 프렌드 [Korean]','Doujinshi','https://e-hentai.org/g/3733409/ded55ea033/',1768257294);
INSERT INTO "hitomi-history" VALUES(5262,'3733396','(C95) [Sucharaka Knight! (Orita)] Yoi Drake-san II (Fate/Grand Order) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3733396/4d93f66457/',1768257294);
INSERT INTO "hitomi-history" VALUES(5263,'3733227','[Pizza ROTTEN (RottenPizza)] Konoyo ni Umareta Sono Imi o | 이 세상에 태어난 그 의미를 (Blue Archive) [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3733227/5ba64ea8cc/',1768257294);
INSERT INTO "hitomi-history" VALUES(5264,'3733135','(C107) [Kawaraya-Koubou (Kawaraya)] Urawa Hanako no Shiawase na Seikatsu | 우라와 하나코의 행복한 성활 (Blue Archive) [Korean] [Team Edge]','Doujinshi','https://e-hentai.org/g/3733135/dd48f6b1cc/',1768257294);
INSERT INTO "hitomi-history" VALUES(5265,'3732908','[Anmitsuyomogitei (Michiking)] Succubus Seitokai Shiko Shiko Shikkoubu - Succubus Student council? Fap Fap Executive board | 서큐버스 성도회 문질문질 집행부 1 (노모) [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3732908/82f6010298/',1768257294);
INSERT INTO "hitomi-history" VALUES(5266,'3732905','[Eruunagi (Eruu)] Osananajimi wa Seihoushi Toban | 소꿉친구는 성봉사 당번 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732905/b974b9c672/',1768257294);
INSERT INTO "hitomi-history" VALUES(5267,'3732896','[Karuwani (Rama)] Ore, Onna ni Nacchatta | 나, 여자가 되어버렸어 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732896/75508f9158/',1768257294);
INSERT INTO "hitomi-history" VALUES(5268,'3732884','[Paint Lab (L''s)] Akuma no Choukyou | 악마의 조교 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732884/b5c084232d/',1768257294);
INSERT INTO "hitomi-history" VALUES(5269,'3732844','[Hiiro no Kenkyuushitsu (Hitoi)] Ochiba Nikki -Jitaku Choukyou Hen 2- | 낙엽일기 - 자택조교 편2 - [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732844/fb492ae4e8/',1768257294);
INSERT INTO "hitomi-history" VALUES(5270,'3732831','[Danimaru] Jane | 제인 도 (ZenZero Gyaku Ra Goudou "Phaethon Assault") (Zenless Zone Zero) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732831/6704164418/',1768257294);
INSERT INTO "hitomi-history" VALUES(5271,'3732815','[Kakuzatou (Various)] ZenZero Icha Love Ero Goudou "ZenEro" Vol. 2 | 젠레스 합동 동인지2 (Zenless Zone Zero) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732815/56c20b4484/',1768257294);
INSERT INTO "hitomi-history" VALUES(5272,'3732808','[BINZOKO (Shinomi)] Shigure wa Yuki o Torakashite | 시구레는 눈을 녹이고 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732808/928706d14e/',1768257294);
INSERT INTO "hitomi-history" VALUES(5273,'3732805','[Yashiro Plus. (Sakon Subaru)] Bishokuka no Himegoto | 미식가의 비밀   (Blue Archive)  [Korean]  [Digital]','Doujinshi','https://e-hentai.org/g/3732805/00582b306b/',1768257294);
INSERT INTO "hitomi-history" VALUES(5274,'3732776','[Gakeuesha. (Gakeo)] Kousakinmu 3 | 교차근무3 [Korean]','Doujinshi','https://e-hentai.org/g/3732776/39f0074baa/',1768257294);
INSERT INTO "hitomi-history" VALUES(5275,'3732723','[studio M3 (m3w3m)] Oji Shiikubu ga Ecchi Sugiru node Wakaraseru Hanashi.｜아저씨 사육부가 너무 꼴려서 참교육하는 썰. [Korean]','Doujinshi','https://e-hentai.org/g/3732723/98ca80d3e5/',1768257294);
INSERT INTO "hitomi-history" VALUES(5276,'3732696','[Tokonatsu Sanshouuo (Pegina)] Otokogirai JC Oji-san to Isshuukan Koibito Keiyaku | 남자가 싫은 JC 아저씨와 일주일간 연인 계약 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3732696/ababc7f286/',1768257294);
INSERT INTO "hitomi-history" VALUES(5277,'3732528','[Ashizuki] Hisho-kun wa Daitan | 비서 군은 대담 [Korean]','Doujinshi','https://e-hentai.org/g/3732528/066fd681b2/',1768257294);
INSERT INTO "hitomi-history" VALUES(5278,'3732494','少女落描中 (暇人♡いず) 트위터 짤 모음','Image Set','https://e-hentai.org/g/3732494/387ded6be8/',1768257294);
INSERT INTO "hitomi-history" VALUES(5279,'3732443','[Jewel] Hitozuma o Saimin de Kyousei shite Mama ni suru | 유부녀를 최면으로 교정해 엄마로 만들기 [Korean]','Artist CG','https://e-hentai.org/g/3732443/a685a64200/',1768257294);
INSERT INTO "hitomi-history" VALUES(5280,'3732187','[Rapid Rabbit (Tomotsuka Haruomi)] Reiwa no Dara-san Koushiki no You de Hikoushiki na Inchiki Hon (korean) [Digital]','Doujinshi','https://e-hentai.org/g/3732187/b9ed8735bf/',1768257294);
INSERT INTO "hitomi-history" VALUES(5281,'3732049','(C85) [Cath×Tech (pyz)] Haguro no Tenshi | 검은 날개의 천사 (Kantai Collection -KanColle-) [Korean]','Doujinshi','https://e-hentai.org/g/3732049/688f541009/',1768257294);
INSERT INTO "hitomi-history" VALUES(5282,'3731931','[Eonsang] KALINA (Girls'' Frontline)','Doujinshi','https://e-hentai.org/g/3731931/51c03c12d1/',1768257294);
INSERT INTO "hitomi-history" VALUES(5283,'3731683','[Kakuzatou (Various)] BluArch Paizuri Goudou "BlunDechive" | 블루아카 파이즈리 합동지 BlunDechive (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3731683/8b3e4c1761/',1768257294);
INSERT INTO "hitomi-history" VALUES(5284,'3731638','[Enokido] Hametami Girl | 박음직한 걸 [Korean] [Digital]','Manga','https://e-hentai.org/g/3731638/25b5abf351/',1768257294);
INSERT INTO "hitomi-history" VALUES(5285,'3731458','[Kawaiso Nanoha Nukeru (Nukeru)] Kowareta Asuna | 망가진 아스나 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3731458/c8e9418afc/',1768257294);
INSERT INTO "hitomi-history" VALUES(5286,'3731435','[Calm Atomosphere (Shinya)] Kimi no Maku o Yaburu no wa Boku dato Omotteta··· 2 - Hametsu Hen | 너의 막을 찢는 건 나라고 생각했다.. 2 -파멸편- [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3731435/a3ff594450/',1768257294);
INSERT INTO "hitomi-history" VALUES(5287,'3731370','[Kusa Soda (DaRoon5)] Mahou Shoujo wa Minna Sukebe dakara 3 | 마법소녀는 모두 밝히니까 3 (Fate/Kaleid Liner Prisma Illya) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3731370/fc470fa245/',1768257294);
INSERT INTO "hitomi-history" VALUES(5288,'3731097','[Poccora] 司波深雪 七草真由美 アナル調教 | 시바 미유키 사에구사 마유미 아날 조교 [Korean]','Doujinshi','https://e-hentai.org/g/3731097/71725cc564/',1768257294);
INSERT INTO "hitomi-history" VALUES(5289,'3731096','[kkan] Elena (EternalReturn) [Decensored]','Doujinshi','https://e-hentai.org/g/3731096/a4a0cb8417/',1768257294);
INSERT INTO "hitomi-history" VALUES(5290,'3731087','[kkan] Elena (EternalReturn)','Doujinshi','https://e-hentai.org/g/3731087/6363320c5b/',1768257294);
INSERT INTO "hitomi-history" VALUES(5291,'3730852','[Uzura Frontier (Mukimoto Koko)] Ochinpo Gourmet Reporter Mue-chan 〜 Honpengo no Kanochi Sex hen 〜 | 자지 맛집 리포터 무에 짱 ~본편 후의 완전타락 섹스편~ [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3730852/cecbd788e4/',1768257294);
INSERT INTO "hitomi-history" VALUES(5292,'3730700','[Uzura Frontier (Mukimoto Koko)] Ochinpo Gourmet Reporter Mue-chan | 자지 맛집 리포터 무에 짱 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3730700/7ac3ff6d89/',1768257294);
INSERT INTO "hitomi-history" VALUES(5293,'3730591','[Bukkaketainaa (Kaketainaa)] Jimi Otaku Megane-chan to Icha Love H 2 | 수수한 오타쿠 안경녀와 순애 H 2 [Korean]','Doujinshi','https://e-hentai.org/g/3730591/3b0b2b0504/',1768257295);
INSERT INTO "hitomi-history" VALUES(5294,'3730590','[Bukkaketainaa (Kaketainaa)] Jimi Otaku Megane-chan to Icha Love H 3 | 수수한 오타쿠 안경녀와 순애 H 3 [Korean]','Doujinshi','https://e-hentai.org/g/3730590/7d4216c7a1/',1768257295);
INSERT INTO "hitomi-history" VALUES(5295,'3730589','[Bukkaketainaa (Kaketainaa)] Ero Ero Kaihatsubu! | 에로에로 개발부! [Korean]','Doujinshi','https://e-hentai.org/g/3730589/cc7dd0b2e2/',1768257295);
INSERT INTO "hitomi-history" VALUES(5296,'3730586','[Bukkaketainaa (Kaketainaa)] Jimi Otaku Megane-chan to Icha Love H | 수수한 오타쿠 인경녀랑 순애 섹스 [Korean]','Doujinshi','https://e-hentai.org/g/3730586/196f3373bc/',1768257295);
INSERT INTO "hitomi-history" VALUES(5297,'3730317','[Twitter] 에이브람스 (0ABRAMS0)','Image Set','https://e-hentai.org/g/3730317/1d90e740cc/',1768257295);
INSERT INTO "hitomi-history" VALUES(5298,'3730259','[Pixiv] 水酸基 (114466830)','Image Set','https://e-hentai.org/g/3730259/25178d2048/',1768257295);
INSERT INTO "hitomi-history" VALUES(5299,'3730244','[Fuwatoro Opanchu Cake] Boshi Futari Gurashi Dai Yon Shou "Kaiseki" [Korean]','Doujinshi','https://e-hentai.org/g/3730244/019984c7ea/',1768257295);
INSERT INTO "hitomi-history" VALUES(5300,'3730091','[Shin Hijiridou Honpo (Hijiri Tsukasa)] H na Fuushuu ga Aru Inaka no Shinseki ga, Zenin Sukebe Sugiru Hanashi. 2 | 야한 풍습이 있는 시골 친척들이 모두 초음란한 이야기 2 [Korean] [팀 숙녀] [Digital]','Doujinshi','https://e-hentai.org/g/3730091/47914e7c98/',1768257295);
INSERT INTO "hitomi-history" VALUES(5301,'3730086','[Kuruto] Sexless no Kyonyuu Haha ni Nori de Kisaseta Mizugi ga Erosugita node Chichi no Kawari ni Chinpo Iretara Mainichi Nori de Nakadashi Sasetekureru You ni Natta Hanashi | 섹스리스인 거유 엄마에게 떠밀듯이 입혀본 수영복이 너무 에로해서 아빠 대신 자지를 찔러 넣었더니 매일 떠밀려서 안에 싸게 해주는 이야기 [Korean] [팀 숙녀]','Doujinshi','https://e-hentai.org/g/3730086/ca94ac8c9e/',1768257295);
INSERT INTO "hitomi-history" VALUES(5302,'3730063','[Kamiya Ogawa] Boku wa Mama-tachi o Fushigi na Amedama de Iyashitai ch.1 | 나는 엄마들을 신비한 사탕으로 치유하고 싶다 ~ 제1화[Korean][팀 숙녀][Digital][Ongoing]','Manga','https://e-hentai.org/g/3730063/493106df8c/',1768257295);
INSERT INTO "hitomi-history" VALUES(5303,'3730049','[U.R.C (Momoya Show-Neko)] Omakebon Collection 5 -EroCure Hen- | 덤책 컬렉션 5 -에로큐어 편- (Precure Series) [Korean] [팀 노고치] [Digital]','Doujinshi','https://e-hentai.org/g/3730049/70a978b972/',1768257295);
INSERT INTO "hitomi-history" VALUES(5304,'3730042','[SORA] PRESSURE: Korean Rice Bunnies [hiatus]','Doujinshi','https://e-hentai.org/g/3730042/3ba79f1885/',1768257295);
INSERT INTO "hitomi-history" VALUES(5305,'3730005','[Fuwatoro Opanchu Cake] Boshi Futari Gurashi Dai San Shou "Hankou" [Korean]','Doujinshi','https://e-hentai.org/g/3730005/071e1ec638/',1768257295);
INSERT INTO "hitomi-history" VALUES(5306,'3729881','[Paya8] Yowami o Nigirareta Onna 5 [Japanese, Korean, Textless] (Decensored, Hi-res)','Doujinshi','https://e-hentai.org/g/3729881/b140656cf7/',1768257295);
INSERT INTO "hitomi-history" VALUES(5307,'3729675','[Otoshidokoro (Mashiko)] Sensei Papa-Katsu tte Nan desu ka? | 선생님, 파파카츠가 뭔가요? (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3729675/24b93a7d0f/',1768257295);
INSERT INTO "hitomi-history" VALUES(5308,'3729647','[Hakeashi] Hasumi Netorase (Junai) Zen 5p (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3729647/471c4dd51e/',1768257295);
INSERT INTO "hitomi-history" VALUES(5309,'3729594','[Sabaku] Mayonaka no Yoruko-san "Yoruko ga Aite Shite Ageru" (COMIC LOE VOL.18 null) [Korean] [팀 털난보리]','Manga','https://e-hentai.org/g/3729594/2ac007e826/',1768257295);
INSERT INTO "hitomi-history" VALUES(5310,'3729358','[Haku Works (Haku)] Phoebe Bifuu Haven no Yume (Wuthering Waves) [Korean]','Doujinshi','https://e-hentai.org/g/3729358/20ae3c3d49/',1768257295);
INSERT INTO "hitomi-history" VALUES(5311,'3729357','[Ramuda] Class no Gal ni Shiboritorareru Ohanashi (Hololive) [Korean]','Doujinshi','https://e-hentai.org/g/3729357/95d20c8d02/',1768257295);
INSERT INTO "hitomi-history" VALUES(5312,'3729348','[Pantie Party Project (Nanasumi)] BluArch Taimanin II Taimanin Sakurako Jinkaku Haisetsu ni Otsu | 블루아카 대마인 II 대마인 사쿠라코 인격배설타락 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3729348/a2d0f0b1b4/',1768257295);
INSERT INTO "hitomi-history" VALUES(5313,'3729327','[Waribashi Kouka] "Teisou Gyakuten" Choushi ni Notta Ouji-sama-kei no Senpai, Netorarete Goukyuu Nouhakai Akume o Hirou shite shimau | 【정조역전】깝치는 왕자님계 선배가 네토라레 당해 오열하며 뇌가 녹아버린 절정을 보이고 만다 [Korean]','Doujinshi','https://e-hentai.org/g/3729327/ffa27c6846/',1768257295);
INSERT INTO "hitomi-history" VALUES(5314,'3729235','[Konoshige] Warui Ko Yaehata-san | 나쁜아이 야에하타씨 + 추가분 (COMIC Shitsurakuten 2021-12) [Korean] [Digital]','Manga','https://e-hentai.org/g/3729235/16f214726d/',1768257295);
INSERT INTO "hitomi-history" VALUES(5315,'3729234','[Soborodon (Hiji Chaba)] Satsuki to Ichaicha Saimin Ecchi | 사츠키와 러브러브 최면 섹스 (Blue Archive) [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3729234/dcbd5b3b49/',1768257295);
INSERT INTO "hitomi-history" VALUES(5316,'3729213','[PLATONiCA (Nyorubee)] Hee~ Sou Yatte Ochinpo Iratsukasete kurundaa, Iiyo Kinayo I 헤에~ 그런 식으로 자지를 화나게 하는구나, 좋아 와라 [korean]','Doujinshi','https://e-hentai.org/g/3729213/8079aee058/',1768257295);
INSERT INTO "hitomi-history" VALUES(5317,'3728705','[Inbou no Teikoku (Indo Curry)] Konyakusha no Imouto wa Kao SSR, Seikaku Saiaku Jigoku no Ero Dance Onna. | 약혼녀의 여동생은 얼굴 SSR, 성격 최악 지옥의 에로 댄스녀. [Korean] [Team Edge] [Decensored]','Doujinshi','https://e-hentai.org/g/3728705/07c0ebbf90/',1768257295);
INSERT INTO "hitomi-history" VALUES(5318,'3728615','[Gomuhachi (Gomu)] Cool-kei Gal wa Oji-san tachi no Onaho | 시크한 갸루는 아저씨들의 오나홀 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3728615/8a230caebf/',1768257295);
INSERT INTO "hitomi-history" VALUES(5319,'3728553','[Umeda Nautilus] Peaceful Face! | 피스풀 페이스! [Korean] [팀 오바참치] [Digital]','Manga','https://e-hentai.org/g/3728553/910c2d9b21/',1768257295);
INSERT INTO "hitomi-history" VALUES(5320,'3728552','(C107) [Kuuchuusen (mko)] Sankaku comic vol. 3 Ayano (Yuru Camp) [Korean]','Doujinshi','https://e-hentai.org/g/3728552/eab4f778ef/',1768257295);
INSERT INTO "hitomi-history" VALUES(5321,'3728485','[Ame Ramune (Amecha)] Arimura Mao vs Saimin Oji-san | 아리무라 마오 vs 최면 아저씨 (Gakuen IDOLM@STER) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3728485/8e8f0e22c0/',1768257295);
INSERT INTO "hitomi-history" VALUES(5322,'3728237','[5t] Mommy Called Away [Korean]','Artist CG','https://e-hentai.org/g/3728237/c64d844aa9/',1768257295);
INSERT INTO "hitomi-history" VALUES(5323,'3728215','[5t] Family Matters [Korean]','Artist CG','https://e-hentai.org/g/3728215/e8bbcc6ed1/',1768257295);
INSERT INTO "hitomi-history" VALUES(5324,'3728189','[5t] Classmate Mommy [Korean]','Artist CG','https://e-hentai.org/g/3728189/ba0915ccc9/',1768257295);
INSERT INTO "hitomi-history" VALUES(5325,'3728177','[Tokupyon] QoS 아이샤의 성교육 [Korean]','Artist CG','https://e-hentai.org/g/3728177/f67fa3676a/',1768257295);
INSERT INTO "hitomi-history" VALUES(5326,'3728127','[Tokupyon] QoS 실피의 성교육 [Korean]','Artist CG','https://e-hentai.org/g/3728127/ba7a55dd58/',1768257295);
INSERT INTO "hitomi-history" VALUES(5327,'3728062','[Shaberu Suiteki (Saiun)] Toriko roll (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3728062/07b8f69c33/',1768257295);
INSERT INTO "hitomi-history" VALUES(5328,'3728031','[Pixiv] Daram (72603788) [23.11 - ]','Image Set','https://e-hentai.org/g/3728031/ecf17eb708/',1768257295);
INSERT INTO "hitomi-history" VALUES(5329,'3728029','[Pixiv] kkan (5858480)','Image Set','https://e-hentai.org/g/3728029/2a88a15c40/',1768257295);
INSERT INTO "hitomi-history" VALUES(5330,'3727737','[Tokupyon] 네토라레 SAO 1-29 + Censored ver (Sword Art Online) [Korean]','Artist CG','https://e-hentai.org/g/3727737/ba5e62c455/',1768257295);
INSERT INTO "hitomi-history" VALUES(5331,'3727668','[LV426 (Mecha Sharekoube)] Dancing crazy teacher (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3727668/4b9957cc7c/',1768257295);
INSERT INTO "hitomi-history" VALUES(5332,'3727653','[Shoujo Rakugakichuu (Himajin no Izu)] skeb na Gensou Shoujo Shuu 8 | 음란한 환상 소녀집 8 (Touhou Project) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3727653/6365c33c4c/',1768257295);
INSERT INTO "hitomi-history" VALUES(5333,'3727615','[T.cop (Natsuki Kiyohito)] Jimiko to Ichinichijuu Sex | 평범녀랑 하루 종일 섹스 [Korean] [스마일 슬라임] [Digital]','Doujinshi','https://e-hentai.org/g/3727615/6bad7e65d9/',1768257295);
INSERT INTO "hitomi-history" VALUES(5334,'3727612','[Kabitto, Kiratto (Kabikira)] Harande mo? Kawaii | 임신해도? 귀여워 (Gakuen IDOLM@STER) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3727612/d82a462fe2/',1768257295);
INSERT INTO "hitomi-history" VALUES(5335,'3727556','[Pentacle (Shimipan)] Shikatanaku Kaa-chan to Sex Shimasu 6 | 어쩔 수 없이 엄마와 섹스합니다6 [Korean]','Doujinshi','https://e-hentai.org/g/3727556/f25d2fc6d4/',1768257295);
INSERT INTO "hitomi-history" VALUES(5336,'3727551','[Kakuninii] Ningen Sousa RemoCon 4 | 인간조작 리모컨4 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3727551/9d5c12197e/',1768257295);
INSERT INTO "hitomi-history" VALUES(5337,'3727505','[kkan] Mai (EternalReturn) [Decensored]','Doujinshi','https://e-hentai.org/g/3727505/46956cc0d4/',1768257295);
INSERT INTO "hitomi-history" VALUES(5338,'3727485','[kkan] Mai','Doujinshi','https://e-hentai.org/g/3727485/c144c81366/',1768257295);
INSERT INTO "hitomi-history" VALUES(5339,'3727481','[Sanuki] Watashi ga Zettai, Mamoru Kara | 내가 반드시 지킬테니까 (COMIC X-EROS #114) [Korean] [Digital]','Manga','https://e-hentai.org/g/3727481/8a55119848/',1768257295);
INSERT INTO "hitomi-history" VALUES(5340,'3727409','[Quater] 노란장판 남매 01','Doujinshi','https://e-hentai.org/g/3727409/0e08523ed9/',1768257295);
INSERT INTO "hitomi-history" VALUES(5341,'3727400','[Felcferc (Yabai Yuu)] Kimidake Wa Yogorenai | 너만은 더럽혀지지 않아 (comic End Roll Vol.2) [Korean]','Manga','https://e-hentai.org/g/3727400/25d7179c0f/',1768257295);
INSERT INTO "hitomi-history" VALUES(5342,'3727334','[Waribashi Kouka] Teisou Gyakuten - Tayoreru Oujisama-kei no Senpai, Hatsu H de Kusso Nasakenai Koshiheko Sourou Sex o Urou Shiteshimau | 【정조역전】의지되는 왕자님계 선배, 첫섹스에서 정말 한심한 테크닉, 조루 섹스를 보여주고 말았다 [Korean]','Doujinshi','https://e-hentai.org/g/3727334/a52cce35e2/',1768257295);
INSERT INTO "hitomi-history" VALUES(5343,'3727316','[Akagai (Mine Thrower)] Natsu no Otouto ga Natsu toshite Sensei ni Dakareru Gainen | 나츠의 동생이 나츠로서 선생님에게 안기는 개념 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3727316/131d94411b/',1768257295);
INSERT INTO "hitomi-history" VALUES(5344,'3727315','[Ryuukakusan Nodoame (Gokubuto Mayuge)] Iochi Mari no IV Taikenki - Iochi Mari no Imege Video Experience Record | 이오치 마리의 IV 체험기 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3727315/d7b53a4a4d/',1768257295);
INSERT INTO "hitomi-history" VALUES(5345,'3727290','[Enokiya (eno)] Arinomama no Yokubou ni Tsuite no Hon - THE SPIRIT OF CANDID, INDIVIDUAL DESIRE | 있는 그대로의 욕망에 관한 책 (Blue Archive) [Korean] [Decensored] [Digital]','Doujinshi','https://e-hentai.org/g/3727290/3590b22915/',1768257295);
INSERT INTO "hitomi-history" VALUES(5346,'3727260','[Pentacle (Shimipan)] Shikatanaku Kaa-chan to Sex Shimasu 5 | 어쩔 수 없이 엄마와 섹스합니다5 [Korean]','Doujinshi','https://e-hentai.org/g/3727260/1beb007d51/',1768257296);
INSERT INTO "hitomi-history" VALUES(5347,'3726992','(C106) [espresso (Mutou Mame)] Ori no Naka no Aoi Tori - Acaged blue bird | 새장 속 파랑새 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3726992/98dfb42e15/',1768257296);
INSERT INTO "hitomi-history" VALUES(5348,'3726608','[Salty Dog. (Umau Mashio)] Saimen Hiken Kiroku -Oki Aoi- | 최면피험기록 오키 아오이 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726608/07fd3b2855/',1768257296);
INSERT INTO "hitomi-history" VALUES(5349,'3726604','[piccione!!] Zokuse no Kyoshisha - Worldly Tutor | 속세의 지도자 (Zenless Zone Zero) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726604/3a6b6802b5/',1768257296);
INSERT INTO "hitomi-history" VALUES(5350,'3726602','[Dusuya-san (Dusu)] Maia wa Warui Ko | 마이아는 나쁜 아이 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726602/23c3e9f536/',1768257296);
INSERT INTO "hitomi-history" VALUES(5351,'3726587','(C106) [Happy Mayonnaise (Asla)] Sensei Kore wa Watashi no Handan desu Douzo Goriyou Kudasai | 선생님 이건 제 판단이니까 마음 편히 이용해 주세요 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3726587/0b04159f19/',1768257296);
INSERT INTO "hitomi-history" VALUES(5352,'3726555','[Mochinchi (Mo)] Netorase Trial Boku no Tame ni Neru Kanojo | 네토라세 트라이얼 나를 위해 안기는 그녀 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726555/58e6c12168/',1768257296);
INSERT INTO "hitomi-history" VALUES(5353,'3726465','[Mugen Karaage (agachi)] Fushigi na Kusuri o Nonjatta? | 이상한 약을 먹어버렸어? (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3726465/055b40ed95/',1768257296);
INSERT INTO "hitomi-history" VALUES(5354,'3726256','[KUROKUDOYA (Furisuku)] Tokushu Seiheki Oji-san ga Toaru Idol ni Saimin Kakete Iroiro Suru Hanashi sono 2 | 특수 성벽 아저씨가 어느 아이돌을 최면을 걸어서 여러가지 하는 이야기 그 2 + 덤 만화 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726256/94a66fd3a3/',1768257296);
INSERT INTO "hitomi-history" VALUES(5355,'3726230','[Mugen Karaage (Agachi)] Ecchi na Seito wa Osuki desu ka? | 야한 학생은 좋아하시나요? (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3726230/7821a302b5/',1768257296);
INSERT INTO "hitomi-history" VALUES(5356,'3726195','[Tabe Koji] PinSalo Sniper 3 [Korean]','Manga','https://e-hentai.org/g/3726195/5409f4eb9d/',1768257296);
INSERT INTO "hitomi-history" VALUES(5357,'3726194','[Akatsuki Souken] Mama tori kagai jugyo 2[마마 빼앗기 특별수업2][Korean] [MTL][Upscale]','Artist CG','https://e-hentai.org/g/3726194/d6c0af646b/',1768257296);
INSERT INTO "hitomi-history" VALUES(5358,'3726186','[C.N.P (Clone Ningen)] Onna Kyoshi 4-nin no Hatenaki Mesu Bato [korean]','Doujinshi','https://e-hentai.org/g/3726186/e0f50400a1/',1768257296);
INSERT INTO "hitomi-history" VALUES(5359,'3726149','[Pixiv] hellaP (3329134) 2026.01.07','Image Set','https://e-hentai.org/g/3726149/a0891bbb43/',1768257296);
INSERT INTO "hitomi-history" VALUES(5360,'3726141','[Maron☆Maron] Hitozuma Classmate | 유부녀 클래스메이트 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3726141/0ffd5d939c/',1768257296);
INSERT INTO "hitomi-history" VALUES(5361,'3726122','[Urasazan (Minamino Sazan)] Kanojo ga Imma ni Kigaetara | 그녀가 음마로 갈아입는다면 (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3726122/74dd45d987/',1768257296);
INSERT INTO "hitomi-history" VALUES(5362,'3726107','[Eonsang] 2025 December reward [Decensored]','Image Set','https://e-hentai.org/g/3726107/c035a97b80/',1768257296);
INSERT INTO "hitomi-history" VALUES(5363,'3726104','[Eonsang] Grizzly mkv (Girls'' Frontline) [Decensored]','Artist CG','https://e-hentai.org/g/3726104/a961453075/',1768257296);
INSERT INTO "hitomi-history" VALUES(5364,'3726103','[Eonsang] Kalina 1~5 (Girls'' Frontline) [Decensored]','Artist CG','https://e-hentai.org/g/3726103/b2c573fc08/',1768257296);
INSERT INTO "hitomi-history" VALUES(5365,'3726102','[Eonsang] Lenna (UMP9) (Girls'' Frontline) [Decensored]','Artist CG','https://e-hentai.org/g/3726102/c9646b778b/',1768257296);
INSERT INTO "hitomi-history" VALUES(5366,'3726008','[Esora note (Majima Shiroyuki)] Takagaki Kaede Interview | 타카가키 카에데 인터뷰 (THE IDOLM@STER CINDERELLA GIRLS) [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3726008/1799cca470/',1768257296);
INSERT INTO "hitomi-history" VALUES(5367,'3725984','[蝶花豚サークル] 형수 ~결혼 1년차의 여름축제날 밤…시동생에게, 격렬하게 따먹혀버렸습니다~ [Korean]','Doujinshi','https://e-hentai.org/g/3725984/ad7478f53d/',1768257296);
INSERT INTO "hitomi-history" VALUES(5368,'3725971','[gura] ojou-sama to mushi no ecchi na taikendan | 아가씨와 벌레의 으흐흐한 경험담','Doujinshi','https://e-hentai.org/g/3725971/416522bb66/',1768257296);
INSERT INTO "hitomi-history" VALUES(5369,'3725969','[Yawaraka Taiyou (Shake)] Mesugaki Kouhai Sasoi Uke Hon 2 | 메스가키 후배와 공수교대하는 책 2 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3725969/77b537d61d/',1768257296);
INSERT INTO "hitomi-history" VALUES(5370,'3725916','코믹 메이플스토리 오프라인 RPG 91-100권','Non-H','https://e-hentai.org/g/3725916/9fc1533042/',1768257296);
INSERT INTO "hitomi-history" VALUES(5371,'3805936','(C106) [Kemomimi-chanya (Naga U)] Iori ni Iroiro Kitemoraitai! (Blue Archive) [korean]','Doujinshi','https://e-hentai.org/g/3805936/27d48c8a16/',1771916239);
INSERT INTO "hitomi-history" VALUES(5372,'3805879','[teitei]  제멋대로인 누나에게 야한짓을 해서 복수하기 chōshi notteru nēchan ni eroikoto shite korashimete yaru','Doujinshi','https://e-hentai.org/g/3805879/16c46ea3f2/',1771916239);
INSERT INTO "hitomi-history" VALUES(5373,'3805609','(C103) [Mannen Dokodoko Dondodoko (Tottotonero Tarou.)] POCKET BITCH 2 | 포켓 빗치 2 (Pokémon Sun & Moon) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805609/97e7c99597/',1771916239);
INSERT INTO "hitomi-history" VALUES(5374,'3805443','[Tottotonero Tarou.] Saimin Sokuochi Lillie-chan + Omake (Pokémon Sun & Moon) [Korean] [Team Edge] [Digital] (decensored)','Doujinshi','https://e-hentai.org/g/3805443/0c37e00c9c/',1771916239);
INSERT INTO "hitomi-history" VALUES(5375,'3805404','[Mannen Dokodoko Dondodoko (Tottotonero Tarou.)] Fuusa Kuiki WILD SEX ZONE (Pokémon LEGENDS Z-A) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805404/1fe571f6c4/',1771916239);
INSERT INTO "hitomi-history" VALUES(5376,'3805185','[Goromenz (Yasui Riosuke)] Ninkan Gakkou 2 | 임간학교 2 [Korean]','Doujinshi','https://e-hentai.org/g/3805185/506cc0233d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5377,'3805114','발정 마법을 견디면 5천만 엔','Doujinshi','https://e-hentai.org/g/3805114/b0c04d3f09/',1771916239);
INSERT INTO "hitomi-history" VALUES(5378,'3805104','[bekobeko] Chuumon shita Nikuningyou ni Chinpo ga Tsuiteiru no desu ga | 주문한 육인형에 자지가 달려있습니다만 [Korean] [Rezel]','Doujinshi','https://e-hentai.org/g/3805104/566f8c3dd9/',1771916239);
INSERT INTO "hitomi-history" VALUES(5379,'3805097','[KS'' Works (KS)] MONOCHROME AFFECTION | 모노크롬 어펙션 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805097/d78cc15692/',1771916239);
INSERT INTO "hitomi-history" VALUES(5380,'3804906','[Pixiv] NDGD (5624416) 2026.02.23','Image Set','https://e-hentai.org/g/3804906/804da4b5e5/',1771916239);
INSERT INTO "hitomi-history" VALUES(5381,'3804899','[Chirisiya (Chirisiya Kouetsu)] Watashi-tachi Futari de Chikara o Awasereba Futanari Onna Kanbu Nanka ni Zettai ni Makenai‼ | 우리 두 사람이 힘을 합치면 후타나리 여성 간부 따위에게 절대 지지 않아!! [Korean]','Doujinshi','https://e-hentai.org/g/3804899/e66ae33215/',1771916239);
INSERT INTO "hitomi-history" VALUES(5382,'3804833','[Sagattoru] 여번장 납치강간 프리퀄  SKEBsスケベ⑬⑭','Doujinshi','https://e-hentai.org/g/3804833/d87df96bd0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5383,'3804802','[Tonikaku] Josouko Hatten-kei <<Senkabano Shinrinkouen Hen>> | 핫텐계 여장 남자 <<센카바노 삼림 공원 편>> [Korean]','Doujinshi','https://e-hentai.org/g/3804802/e609803b0d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5384,'3804801','[Etori] Gaman dekinai Otou-san | 참을 수 없는 아빠 [Korean]','Doujinshi','https://e-hentai.org/g/3804801/8119777adc/',1771916239);
INSERT INTO "hitomi-history" VALUES(5385,'3804800','[Etori] Ero Trap ga Dekiru made | 에로 트랩이 완성되기까지 [Korean]','Doujinshi','https://e-hentai.org/g/3804800/75d1ac8d44/',1771916239);
INSERT INTO "hitomi-history" VALUES(5386,'3804799','[Etori] Sister no Himitsu | 수녀님의 비밀 [Korean]','Doujinshi','https://e-hentai.org/g/3804799/b1be3158d2/',1771916239);
INSERT INTO "hitomi-history" VALUES(5387,'3804798','[Etori] Boku wa Suit o Kita Onaho desu | 저는 정장을 입은 암컷 오나홀입니다 [Korean]','Doujinshi','https://e-hentai.org/g/3804798/7a48755e43/',1771916239);
INSERT INTO "hitomi-history" VALUES(5388,'3804659','[GENJU MINZOKU (Sato) ] Shanai no Himegoto ~Stress Kaishou ni Kaisha no Toilet de Onani shite itara, Kouhai ni Kikarete shimatte ita Hanashi~ | 사내의 비밀～스트레스 해소를 위해 회사 화장실에서 자위하고 있었는데, 후배에게 들켜버린 이야기～ [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3804659/13e2f98b7d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5389,'3804651','(Kemoket 16) [CandleLight (Suigi)] Shiharai wa MyBody de! [Korean]','Doujinshi','https://e-hentai.org/g/3804651/aa1614aa82/',1771916239);
INSERT INTO "hitomi-history" VALUES(5390,'3804634','[Pairesshu] Kyouiku Mama o Iinarinishite Sex Shita Hanashi | 교육열이 높은 엄마를 복종시켜 섹스한 이야기 [Korean]','Doujinshi','https://e-hentai.org/g/3804634/b1d4cdeeeb/',1771916239);
INSERT INTO "hitomi-history" VALUES(5391,'3804628','[Yachou (Bloiler Yachou)] Ichiryuu Sennyuu Sousakan Haiboku [Korean]','Doujinshi','https://e-hentai.org/g/3804628/556d375409/',1771916239);
INSERT INTO "hitomi-history" VALUES(5392,'3804534','[Bubo] 더위때문이야 (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3804534/206886e8d2/',1771916239);
INSERT INTO "hitomi-history" VALUES(5393,'3804302','[Double Deck] 해후 邂逅-KAIKOU-','Doujinshi','https://e-hentai.org/g/3804302/9870ac7f97/',1771916239);
INSERT INTO "hitomi-history" VALUES(5394,'3804214','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 7 | 용사님은 보수로 유부녀를 희망합니다 7 [Korean] [Digital]','Manga','https://e-hentai.org/g/3804214/6615e830be/',1771916239);
INSERT INTO "hitomi-history" VALUES(5395,'3804093','[heppari] Loremaster Comics ch.1-36 [Korean][ongoing]','Non-H','https://e-hentai.org/g/3804093/f919d315c9/',1771916239);
INSERT INTO "hitomi-history" VALUES(5396,'3804062','[horori] Z.Z.Z Gravure #5: YIXUAN & YeShunguang (Zenless Zone Zero) [Korean]','Doujinshi','https://e-hentai.org/g/3804062/7e23727bfe/',1771916239);
INSERT INTO "hitomi-history" VALUES(5397,'3804043','[horori] Z.Z.Z Gravure #4: NICOLE & MIYABI (Zenless Zone Zero) [Korean]','Doujinshi','https://e-hentai.org/g/3804043/bd3e0d77ea/',1771916239);
INSERT INTO "hitomi-history" VALUES(5398,'3803753','[Kuishinbou (Naitou Haruto)] Aisuru Tsuma ga Zetsurin Shachou no Te ni Ochita Sono Hi 2 | 사랑하는 아내가 절륜 사장의 손에 함락된 그날 2 [Korean]','Doujinshi','https://e-hentai.org/g/3803753/631abb3586/',1771916239);
INSERT INTO "hitomi-history" VALUES(5399,'3803589','[Meganeru / Cherachera] メガネル FANBOX - FULL GALLERY (Updated 2026.02.11)','Image Set','https://e-hentai.org/g/3803589/20ead48b7c/',1771916239);
INSERT INTO "hitomi-history" VALUES(5400,'3803384','[Pixiv] Daram (72603788) [23.11 - ]','Image Set','https://e-hentai.org/g/3803384/5b85d1d2c4/',1771916239);
INSERT INTO "hitomi-history" VALUES(5401,'3803358','[Yurishima Shiro] ZokuZoku·Class ni Hitori dakeno Joshi | 속속·반에서 하나뿐인 여자 [Korean]','Doujinshi','https://e-hentai.org/g/3803358/6dda05099f/',1771916239);
INSERT INTO "hitomi-history" VALUES(5402,'3803249','[Idaten Funisuke] Polynesian Sex de Gaman Dekinai Tsuma | 폴리네시안 섹스를 참지 못한 아내 [Korean]','Doujinshi','https://e-hentai.org/g/3803249/d988dea214/',1771916239);
INSERT INTO "hitomi-history" VALUES(5403,'3803196','[mabo] Kemo Gokoro mo Hogusare Massage [Korean] [LWND]','Manga','https://e-hentai.org/g/3803196/9ba8495755/',1771916239);
INSERT INTO "hitomi-history" VALUES(5404,'3803186','[Suruga Kreuz] Diet Hasumi | 다이어트 하스미 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3803186/116c9b9646/',1771916239);
INSERT INTO "hitomi-history" VALUES(5405,'3803180','[BoriKori]moderately risky.3','Doujinshi','https://e-hentai.org/g/3803180/a4d3d898d1/',1771916239);
INSERT INTO "hitomi-history" VALUES(5406,'3803147','[Kuusou Shoujo (Sutora)] Otsukare desu ka? Aruji-dono! | 피곤하신가요? 주군! (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3803147/eba2469a76/',1771916239);
INSERT INTO "hitomi-history" VALUES(5407,'3803139','[Kuusou Shoujo (Sutora)] Sensei, Yoru wa Issho ni... Itekureru? | 선생님, 밤에는... 같이 있어 줄래? (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3803139/eb1a48dac0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5408,'3802981','[いちのせ] オナホ姉[Textless]','Doujinshi','https://e-hentai.org/g/3802981/5516da9000/',1771916239);
INSERT INTO "hitomi-history" VALUES(5409,'3802949','[Tokupyon] C106 New Release Bonus Book BAD END HEAVEN 6 part0.9','Doujinshi','https://e-hentai.org/g/3802949/884662169d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5410,'3802829','(C106) [chested (Tokupyon)] BAD END HEAVEN 6 part1 (Mushoku Tensei ~Isekai Ittara Honki Dasu~) [Korean]','Doujinshi','https://e-hentai.org/g/3802829/4f30293549/',1771916239);
INSERT INTO "hitomi-history" VALUES(5411,'3802753','[Ichinose] Onaho Ane [Korean]','Doujinshi','https://e-hentai.org/g/3802753/3878882812/',1771916239);
INSERT INTO "hitomi-history" VALUES(5412,'3802707','[BANG-YOU] Shidoukan Video | 지도간 Video (VS 거근 아저씨) [Korean] [Digital]','Manga','https://e-hentai.org/g/3802707/69b7d57051/',1771916239);
INSERT INTO "hitomi-history" VALUES(5413,'3802666','[Teruism (Terubouzu)] Futanari Quartette | 후타나리 콰르텟 [Korean] [도레솔] [Digital]','Doujinshi','https://e-hentai.org/g/3802666/9b76df656f/',1771916239);
INSERT INTO "hitomi-history" VALUES(5414,'3802662','[Sha~ no Futa (Sharaku Kaede)] Kyuu ni Chinpo ga Haetekita Mitsuki-san 2 Himitsu no Shasei Gasshuku!! | 갑자기 자지가 돋아난 미츠키 씨 2 비밀의 사정합숙!! [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3802662/9997d5b091/',1771916239);
INSERT INTO "hitomi-history" VALUES(5415,'3802659','[Sha~ no Futa (Sharaku Kaede)] Kyuu ni Chinpo ga Haetekita Mitsuki-san ga Class no Yankee Onna ni Hamemakuru Hanashi  | 갑자기 자지가 돋아난 미츠키 씨가 반의 양키 여자를 마구 따먹는 이야기 [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3802659/e55118ddce/',1771916239);
INSERT INTO "hitomi-history" VALUES(5416,'3802497','[000_0200] Mahou Shoujo Ni Akogarete works','Image Set','https://e-hentai.org/g/3802497/da780c982d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5417,'3801849','[Idaten Funisuke] Kenka-chuu ni a OnaBare | 싸우는 도중에 자위 들키기 [Korean]','Manga','https://e-hentai.org/g/3801849/185464422c/',1771916239);
INSERT INTO "hitomi-history" VALUES(5418,'3801767','[Riku no Kotoutei (Shayo)] Oushun Jogakuen no Danyuu 4 | 오우슌 여학원의 남자배우 4 [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3801767/43523fb72e/',1771916239);
INSERT INTO "hitomi-history" VALUES(5419,'3801766','[Ringoya (Alp)] Otaku Tomodachi to no Sex wa Saikou ni Kimochi Ii 2  오타쿠 친구랑 하는 섹스는 최고로 기분 좋다2 [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3801766/083d96fac9/',1771916239);
INSERT INTO "hitomi-history" VALUES(5420,'3801736','[Kisaki Noah] Okitsune-sama Konnichiwa (COMIC ExE 65) [Korean] [Digital]','Manga','https://e-hentai.org/g/3801736/5bc8f26107/',1771916239);
INSERT INTO "hitomi-history" VALUES(5421,'3801713','[sunhyun] Kei (Blue Archive) [Japanese, Korean]','Artist CG','https://e-hentai.org/g/3801713/c0ebc360c7/',1771916239);
INSERT INTO "hitomi-history" VALUES(5422,'3801580','[fusuma] MkKo Tomodachi | M과 친구들[Korean]','Doujinshi','https://e-hentai.org/g/3801580/7f5ed0b038/',1771916239);
INSERT INTO "hitomi-history" VALUES(5423,'3801383','[Anon''s Flood Myth (Anon 2-okunen)] Bokutachi, Seiheki Friend. ~Onna Tomodachi no Aidokusho wa Ore no Daisuki na ''Chin Kagi Ero Manga'' deshita~ Zenpen | 우리들, 성벽 프렌드. ~여자 사람 친구의 애독서는 내가 엄청 좋아하는 "좆냄새 맡는 야한 만화" 였습니다 [Korean] [Non-glasses]','Doujinshi','https://e-hentai.org/g/3801383/eb2edbef46/',1771916239);
INSERT INTO "hitomi-history" VALUES(5424,'3801379','[Anon''s Flood Myth (Anon 2-okunen)] Bokutachi, Seiheki Friend. ~Onna Tomodachi no Aidokusho wa Ore no Daisuki na ''Chin Kagi Ero Manga'' deshita~ Zenpen | 우리들, 성벽 프렌드. ~여자 사람 친구의 애독서는 내가 엄청 좋아하는 "좆냄새 맡는 야한 만화" 였습니다 [Korean]','Doujinshi','https://e-hentai.org/g/3801379/af7b99c4a4/',1771916239);
INSERT INTO "hitomi-history" VALUES(5425,'3801296','[Osuwaani] Request Itadaita Mono desu (Mobile Suit Gundam SEED) [Korean]','Doujinshi','https://e-hentai.org/g/3801296/2b0eb081f0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5426,'3801241','[Nakamachi Machi] Bunny Marriage Daisakusen (COMIC Kairakuten BEAST 2026-01) [Korean] [Digital]','Manga','https://e-hentai.org/g/3801241/9421f3e646/',1771916239);
INSERT INTO "hitomi-history" VALUES(5427,'3801203','(COMIC1☆1) [EINSATZ GRUPPE (Charlie Nishinaka)] N 0.1 WHITE DEVIL (Mahou Shoujo Lyrical Nanoha A''s) [korean]','Non-H','https://e-hentai.org/g/3801203/045aba1d3b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5428,'3801046','마법소녀 리리컬 나노하 EXCEEDS (02)','Non-H','https://e-hentai.org/g/3801046/fc21275a4d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5429,'3800929','[TCA Cycle (Gairou)] Homura to Ichinichijuu H Shimakuru Hon | 호무라랑 하루종일 H하는 책 (Xenoblade Chronicles 2) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3800929/c58d963a47/',1771916239);
INSERT INTO "hitomi-history" VALUES(5430,'3800910','[Syunichi Kansuu (Syunichi)] Gachihame SEX Shidou Soushuuhen | 진심교배 SEX지도 총집편 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3800910/314b7e84c7/',1771916239);
INSERT INTO "hitomi-history" VALUES(5431,'3800897','[Tamagou] Tenchou tte, Kyonyuu de Chotto M desu yo ne? 2 | 점장님은, 거유에 살짝 M이죠? 2 [Korean]','Doujinshi','https://e-hentai.org/g/3800897/56ef7be902/',1771916239);
INSERT INTO "hitomi-history" VALUES(5432,'3800822','[Kuusou Shoujo (Sutora)] Goshujin-sama! Asuna-tachi ni Makasete! | 주인님! 아스나 일행에게 맡겨줘! (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3800822/b8da6b91aa/',1771916239);
INSERT INTO "hitomi-history" VALUES(5433,'3800552','[OTOMEKIBUN (Sansyoku Amido.)] Manager-chan Shidouchuu! | 매니저 짱 지도중! [Korean]','Doujinshi','https://e-hentai.org/g/3800552/0cd22de458/',1771916239);
INSERT INTO "hitomi-history" VALUES(5434,'3800528','[Botandou (Kio Shimoku)] Zenbu, Sensei no Sei. 2 Kouhen Futanari Jokyoushi ga Seiyoku Bakuhatsu Oyako o Sukkiri Saseru Hanashi. | 전부, 선생님 탓. 2 후편 후타나리 여교사가 성욕폭발 모녀를 개운하게 하는 이야기. [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3800528/b5d9d8d98b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5435,'3800361','[Narushima Godou] Dekkai Chinko de Suki Houdai | 대물 자지로 마음껏 [Korean] [Digital]','Manga','https://e-hentai.org/g/3800361/4de95eb3c6/',1771916239);
INSERT INTO "hitomi-history" VALUES(5436,'3800123','[vanslaw] NO MORE SECRETS - Chapter 2 - Shower Time Fun |  더 이상 비밀은 없다 - 제2장 - 즐거운 샤워 시간[Korean][팀 숙녀][AI Generated]','Misc','https://e-hentai.org/g/3800123/e86f4f2b24/',1771916239);
INSERT INTO "hitomi-history" VALUES(5437,'3800118','[Scarlett Ann] Dear Clara (Halloween Special - Trick or Treat) [Korean][팀 숙녀]','Western','https://e-hentai.org/g/3800118/b5a91a3190/',1771916239);
INSERT INTO "hitomi-history" VALUES(5438,'3800114','[Garriguex] Bloodline Depravity | 타락의 혈통[Korean][팀 숙녀]','Western','https://e-hentai.org/g/3800114/3de6f80bb7/',1771916239);
INSERT INTO "hitomi-history" VALUES(5439,'3800113','[Akikan] Boshi Seikyouiku Gimu-ka Houan Shimosato-ka | 모자 성교육 의무화법 시모사토 가문[Korean][팀 숙녀] [Digital]','Doujinshi','https://e-hentai.org/g/3800113/d854fd1327/',1771916239);
INSERT INTO "hitomi-history" VALUES(5440,'3800105','[gonza] Shin Tomodachi no Hahaoya (Ge) ch. 13-15 | 신 친구엄마 제13-15화 [Digital][Korean][팀 숙녀][Ongoing]','Manga','https://e-hentai.org/g/3800105/2dfd39c39c/',1771916239);
INSERT INTO "hitomi-history" VALUES(5441,'3799972','[Michiking] Ane Taiken Jogakuryou End Collection + Sister''s Art Archive ｜ 누나 체험 여자기숙사 End Collection (Ane Taiken Jogakuryou ~Limited Edition~) [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3799972/bbc57ff08e/',1771916239);
INSERT INTO "hitomi-history" VALUES(5442,'3799931','[Circle- AV] Pretty Heroine Time Vol. 4','Doujinshi','https://e-hentai.org/g/3799931/0149ab66de/',1771916239);
INSERT INTO "hitomi-history" VALUES(5443,'3799919','[Kyouka Asuka] Batsu Game Sex Toka Iu Gohoubi  (COMIC Kairakuten BEAST 2026-02) [Korean] [팀 털난보리]  [Digital]','Manga','https://e-hentai.org/g/3799919/ddf1308a1b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5444,'3799901','[Hawk Bit (Kouji)] Party Tsuihou sareta TS Succubus-san wa Fukushuu ni Shippai suru | 파티에서 추방된 TS서큐버스는 복수에 실패한다 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3799901/1c158e012d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5445,'3799773','[Toku] Joshidai no Ouji-sama Position nanoni Taikei Daradara na Ko | 여대에서 왕자님 포지션인데 몸매는 늘어진 타입의 아이 [Korean]','Doujinshi','https://e-hentai.org/g/3799773/52d418e200/',1771916239);
INSERT INTO "hitomi-history" VALUES(5446,'3799697','브레머튼','Doujinshi','https://e-hentai.org/g/3799697/50113209a0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5447,'3799608','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 6 | 용사님은 보수로 유부녀를 희망합니다 6 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799608/26322e4cd7/',1771916239);
INSERT INTO "hitomi-history" VALUES(5448,'3799607','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 5 | 용사님은 보수로 유부녀를 희망합니다 5 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799607/8192179895/',1771916239);
INSERT INTO "hitomi-history" VALUES(5449,'3799606','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 4 | 용사님은 보수로 유부녀를 희망합니다 4 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799606/40c64fbe5b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5450,'3799605','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu  - The hero wants a married woman as a reward   3  | 용사님은 보수로 유부녀를 희망합니다 3 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799605/e324d1b41e/',1771916239);
INSERT INTO "hitomi-history" VALUES(5451,'3799604','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 2  | 용사님은 보수로 유부녀를 희망합니다 2 [Korean]  [Digital]','Manga','https://e-hentai.org/g/3799604/1c8c23dc2d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5452,'3799603','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 1 | 용사님은 보수로 유부녀를 희망합니다 1 [Korean]  [Digital]','Manga','https://e-hentai.org/g/3799603/2a2c694569/',1771916239);
INSERT INTO "hitomi-history" VALUES(5453,'3799598','[Studio TAGATA (Yontarou)] Dluminia Oukoku Monogatari 「Onna-Shogun no Zetsubo no Netsubo」｜달미니아 왕국 이야기 「여장군의 절망의 열망」[Korean]','Doujinshi','https://e-hentai.org/g/3799598/8edba2f4ed/',1771916239);
INSERT INTO "hitomi-history" VALUES(5454,'3799332','[Glycogen] Ooya-san wa Osewa ga Osuki♡ (COMIC ExE 67) [Korean] [Digital]','Manga','https://e-hentai.org/g/3799332/24f3035a70/',1771916239);
INSERT INTO "hitomi-history" VALUES(5455,'3799282','마법천자문 45-52권','Non-H','https://e-hentai.org/g/3799282/f5ad258837/',1771916239);
INSERT INTO "hitomi-history" VALUES(5456,'3799123','[Sagattoru] Onna Banchou Saraiyari Shikyuu Uzuite Tomerannee | 여번장 납치강간 "자궁"이 욱신거려서 "멈출" 수 없어 (ANGEL Club 2016-11) [Korean] [Digital]','Manga','https://e-hentai.org/g/3799123/38b25b1332/',1771916239);
INSERT INTO "hitomi-history" VALUES(5457,'3798895','chihel图集','Doujinshi','https://e-hentai.org/g/3798895/a0e66f6eb5/',1771916239);
INSERT INTO "hitomi-history" VALUES(5458,'3798887','[Yesman] Sayonara Jinja | 잘 가 신사 (COMIC Shingeki 2024-12) [Korean] [Digital]','Manga','https://e-hentai.org/g/3798887/591414476d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5459,'3798369','[Kyaradain] Saimin de Otokonoko o Onnanoko ni Shichau Hon | 최면으로 남자애를 여자애로 만들어 버리는 책 [Korean]','Doujinshi','https://e-hentai.org/g/3798369/14bf2126cb/',1771916239);
INSERT INTO "hitomi-history" VALUES(5460,'3798125','(C71) [Circle AV (Minazuki Ayu)] 미소녀전사 한정 프리티 히로인타임 Vol. 6 (파워레인저 트레저포스)','Doujinshi','https://e-hentai.org/g/3798125/fa2c1068b4/',1771916239);
INSERT INTO "hitomi-history" VALUES(5461,'3798034','[Super Ichigo-chan (Misaoka)] Kanojo o Netorareta Kedo Boku wa Shiawase ni Narimasu | 여친을 빼앗겼지만 저는 행복해질 겁니다 [Korean]','Doujinshi','https://e-hentai.org/g/3798034/59315b433e/',1771916239);
INSERT INTO "hitomi-history" VALUES(5462,'3797968','[Doukutsu Tamago] Cosplay Osananajimi (COMIC BAVEL 2026-02) [Korean] [Digital] [Decensored]','Manga','https://e-hentai.org/g/3797968/e58f470049/',1771916239);
INSERT INTO "hitomi-history" VALUES(5463,'3797955','[Doukutsu Tamago] Cosplay Osananajimi (COMIC BAVEL 2026-02) [Korean] [Digital]','Manga','https://e-hentai.org/g/3797955/5be34774ca/',1771916239);
INSERT INTO "hitomi-history" VALUES(5464,'3797938','[Takaman] Kaga [Korean]','Doujinshi','https://e-hentai.org/g/3797938/21a1e2364e/',1771916239);
INSERT INTO "hitomi-history" VALUES(5465,'3797891','[Torii Yoshitsuna] Himadashi Onanie demo Suru ka! | 지루하니 자위라도 할까! [Korean]','Doujinshi','https://e-hentai.org/g/3797891/73bb604f4f/',1771916239);
INSERT INTO "hitomi-history" VALUES(5466,'3797714','[Jewel] Hitozuma o Saimin de Kyousei shite Mama ni suru | 유부녀를 최면으로 교정해 엄마로 만들기 [Korean]','Artist CG','https://e-hentai.org/g/3797714/cf753bcfd6/',1771916239);
INSERT INTO "hitomi-history" VALUES(5467,'3797712','(C104) [Mentaipark (Yamamoto)] Misono Houshi | 미소노 봉사 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3797712/50a4055192/',1771916239);
INSERT INTO "hitomi-history" VALUES(5468,'3797711','[EARRINGS BOM FACTORY (ICHIGAIN)] Wakasa Yue no Ayamachi!? | 와카사 때문에 벌어진 실수!? (Blue Archive) [Korean] [Robeta] [Digital]','Doujinshi','https://e-hentai.org/g/3797711/74d2476f82/',1771916239);
INSERT INTO "hitomi-history" VALUES(5469,'3797710','[Atelier Hinata (Hinata Yuu)] Miyo no Okusuri Delivery (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3797710/ac88a58ce5/',1771916239);
INSERT INTO "hitomi-history" VALUES(5470,'3797705','[Isenori] Class no Anoko wa Ningen o Yameta Ushinyuu Benjo 5 | 교실의 그 아이는 인간을 그만둔 젖소가슴 변기녀 5 [Korean]','Doujinshi','https://e-hentai.org/g/3797705/1613359095/',1771916239);
INSERT INTO "hitomi-history" VALUES(5471,'3797696','[Daiichi Yutakasou (Chiku)] Kanojo o Netorase Fuuzoku ni Nante Tsurete-kun ja Nakatta 2.5 | 여친을 네토라세 풍속에 데려가는게 아니었는데 2.5 [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3797696/a3b23d0ba5/',1771916239);
INSERT INTO "hitomi-history" VALUES(5472,'3797671','[Labomagi! (Takeda Aranobu)] H na Onee-san wa, Suki desu ka? 6 ~Harabote Polynesian Sex to Shinkon Shoya to Anal Haka~ | 야한 누나는 좋아하나요？6 ~배불뚝이 폴리네시안 섹스와 신혼초야와 애널 파과~ [Korean]','Doujinshi','https://e-hentai.org/g/3797671/177e3e73bc/',1771916239);
INSERT INTO "hitomi-history" VALUES(5473,'3797626','마법천자문 구판 12-22권','Non-H','https://e-hentai.org/g/3797626/bf87bda71d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5474,'3797625','마법천자문 구판 1-11권','Non-H','https://e-hentai.org/g/3797625/593d08e608/',1771916239);
INSERT INTO "hitomi-history" VALUES(5475,'3797491','[Minamida Usuke] Dokidoki Occult Kenkyuubu | 두근두근 오컬트 연구부 (두근두근♡폭유 사모님이 너무 야해서!)[Korean] [Digital]','Manga','https://e-hentai.org/g/3797491/c5898f66f0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5476,'3797487','[Michiking] Bitch Slump Azato-san | 빗치 슬럼프 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797487/000436de43/',1771916239);
INSERT INTO "hitomi-history" VALUES(5477,'3797467','[Michiking] Koushoku Henshuu Azato-san | 호색편집 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797467/d083781acf/',1771916239);
INSERT INTO "hitomi-history" VALUES(5478,'3797465','[Michiking] Shouwaru Henshuu Azato-san | 사악편집 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797465/5475ef7eb2/',1771916239);
INSERT INTO "hitomi-history" VALUES(5479,'3797347','[Michiking] Azato Making | 아자토 메이킹 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797347/61bee3e2f0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5480,'3797318','[Takuroodo (Takurowo)] Ikinari kon -After Story- | 갑작스런 결혼 -After Story- [Digital]','Doujinshi','https://e-hentai.org/g/3797318/706af0fedc/',1771916239);
INSERT INTO "hitomi-history" VALUES(5481,'3796974','[Kuusou Shoujo (Sutora)] Kirara de Love Love suru Hon | 키라라로 응애응애 하는 책 (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3796974/45e06208ae/',1771916239);
INSERT INTO "hitomi-history" VALUES(5482,'3796710','(Reitaisai 15) [Anmitsuyomogitei (Michiking)] ANMITSU TOUHOU THE AFTER Vol. 1 | 안미츠 동방 더 애프터 Vol. 1 (Touhou Project) [Korean] [느와카나] [Decensored]','Doujinshi','https://e-hentai.org/g/3796710/3192c2c63b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5483,'3796681','(Kemokko Lovers 5) [Mayoineko (Nezumin)] Inuman 2 - Oinu-sama | 멍멍이 님 [Korean]','Doujinshi','https://e-hentai.org/g/3796681/6227f78ebd/',1771916239);
INSERT INTO "hitomi-history" VALUES(5484,'3796622','[Michiking] Ane Taiken Shuukan | 누나체험 주간  [Korean] [Liberty Library] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3796622/20bc697d33/',1771916239);
INSERT INTO "hitomi-history" VALUES(5485,'3796446','[Doukutsu Tamago] Sokubaku mariage (COMIC BAVEL 2025-11) [Korean] [Digital]','Manga','https://e-hentai.org/g/3796446/92de71b83b/',1771916239);
INSERT INTO "hitomi-history" VALUES(5486,'3796445','[Doukutsu Tamago] Sokubaku mariage (COMIC BAVEL 2025-11) [Korean] [Digital] [Decensored]','Manga','https://e-hentai.org/g/3796445/f8f6a44460/',1771916239);
INSERT INTO "hitomi-history" VALUES(5487,'3796426','Sakiko-san no kantuu moyo ＃2 (AI Generated) [korean] : 사키코씨의 간통사정 2','Misc','https://e-hentai.org/g/3796426/c637b9070a/',1771916239);
INSERT INTO "hitomi-history" VALUES(5488,'3796424','[Corundum] Seikyouiku Jisshuu de Naka no Warui Danjo ga Kumasareru Hanashi | 성교육 실습에서 사이 나쁜 남녀가 짝이 된 이야기 [Korean]','Doujinshi','https://e-hentai.org/g/3796424/f19f36968c/',1771916239);
INSERT INTO "hitomi-history" VALUES(5489,'3796415','[Hardboiled Yoshiko] Elf no ShuuKatsu | 엘프의 종활 [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3796415/8ce90f797f/',1771916239);
INSERT INTO "hitomi-history" VALUES(5490,'3796388','[Boole] 날 괴롭히던 육덕일진녀랑 동거 2 [Korean]','Doujinshi','https://e-hentai.org/g/3796388/5fef510243/',1771916239);
INSERT INTO "hitomi-history" VALUES(5491,'3796343','[Boole] 마법소녀의 전남친 금태양 [Korean]','Doujinshi','https://e-hentai.org/g/3796343/9506367349/',1771916239);
INSERT INTO "hitomi-history" VALUES(5492,'3796322','[Boole] 일진녀 2마리와 동거생활 [Korean]','Doujinshi','https://e-hentai.org/g/3796322/fc102877f0/',1771916239);
INSERT INTO "hitomi-history" VALUES(5493,'3796274','[Fanbox] Kakyuu Bushi [Korean]','Doujinshi','https://e-hentai.org/g/3796274/51c1abbbbd/',1771916239);
INSERT INTO "hitomi-history" VALUES(5494,'3796271','[Boole] 수정버전) 제 남친은 저를 오나홀로 대하지 않아요 [Korean]','Doujinshi','https://e-hentai.org/g/3796271/c122c2cb1d/',1771916239);
INSERT INTO "hitomi-history" VALUES(5495,'3796255','[Boole] 이세계 섹스 라이프 [Korean]','Doujinshi','https://e-hentai.org/g/3796255/3975efe4cf/',1771916239);
CREATE TABLE IF NOT EXISTS "new-item-list" (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
INSERT INTO "new-item-list" VALUES(5246,'3805936','(C106) [Kemomimi-chanya (Naga U)] Iori ni Iroiro Kitemoraitai! (Blue Archive) [korean]','Doujinshi','https://e-hentai.org/g/3805936/27d48c8a16/',1771916239);
INSERT INTO "new-item-list" VALUES(5247,'3805879','[teitei]  제멋대로인 누나에게 야한짓을 해서 복수하기 chōshi notteru nēchan ni eroikoto shite korashimete yaru','Doujinshi','https://e-hentai.org/g/3805879/16c46ea3f2/',1771916239);
INSERT INTO "new-item-list" VALUES(5248,'3805609','(C103) [Mannen Dokodoko Dondodoko (Tottotonero Tarou.)] POCKET BITCH 2 | 포켓 빗치 2 (Pokémon Sun & Moon) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805609/97e7c99597/',1771916239);
INSERT INTO "new-item-list" VALUES(5249,'3805443','[Tottotonero Tarou.] Saimin Sokuochi Lillie-chan + Omake (Pokémon Sun & Moon) [Korean] [Team Edge] [Digital] (decensored)','Doujinshi','https://e-hentai.org/g/3805443/0c37e00c9c/',1771916239);
INSERT INTO "new-item-list" VALUES(5250,'3805404','[Mannen Dokodoko Dondodoko (Tottotonero Tarou.)] Fuusa Kuiki WILD SEX ZONE (Pokémon LEGENDS Z-A) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805404/1fe571f6c4/',1771916239);
INSERT INTO "new-item-list" VALUES(5251,'3805185','[Goromenz (Yasui Riosuke)] Ninkan Gakkou 2 | 임간학교 2 [Korean]','Doujinshi','https://e-hentai.org/g/3805185/506cc0233d/',1771916239);
INSERT INTO "new-item-list" VALUES(5252,'3805114','발정 마법을 견디면 5천만 엔','Doujinshi','https://e-hentai.org/g/3805114/b0c04d3f09/',1771916239);
INSERT INTO "new-item-list" VALUES(5253,'3805104','[bekobeko] Chuumon shita Nikuningyou ni Chinpo ga Tsuiteiru no desu ga | 주문한 육인형에 자지가 달려있습니다만 [Korean] [Rezel]','Doujinshi','https://e-hentai.org/g/3805104/566f8c3dd9/',1771916239);
INSERT INTO "new-item-list" VALUES(5254,'3805097','[KS'' Works (KS)] MONOCHROME AFFECTION | 모노크롬 어펙션 (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3805097/d78cc15692/',1771916239);
INSERT INTO "new-item-list" VALUES(5255,'3804906','[Pixiv] NDGD (5624416) 2026.02.23','Image Set','https://e-hentai.org/g/3804906/804da4b5e5/',1771916239);
INSERT INTO "new-item-list" VALUES(5256,'3804899','[Chirisiya (Chirisiya Kouetsu)] Watashi-tachi Futari de Chikara o Awasereba Futanari Onna Kanbu Nanka ni Zettai ni Makenai‼ | 우리 두 사람이 힘을 합치면 후타나리 여성 간부 따위에게 절대 지지 않아!! [Korean]','Doujinshi','https://e-hentai.org/g/3804899/e66ae33215/',1771916239);
INSERT INTO "new-item-list" VALUES(5257,'3804833','[Sagattoru] 여번장 납치강간 프리퀄  SKEBsスケベ⑬⑭','Doujinshi','https://e-hentai.org/g/3804833/d87df96bd0/',1771916239);
INSERT INTO "new-item-list" VALUES(5258,'3804802','[Tonikaku] Josouko Hatten-kei <<Senkabano Shinrinkouen Hen>> | 핫텐계 여장 남자 <<센카바노 삼림 공원 편>> [Korean]','Doujinshi','https://e-hentai.org/g/3804802/e609803b0d/',1771916239);
INSERT INTO "new-item-list" VALUES(5259,'3804801','[Etori] Gaman dekinai Otou-san | 참을 수 없는 아빠 [Korean]','Doujinshi','https://e-hentai.org/g/3804801/8119777adc/',1771916239);
INSERT INTO "new-item-list" VALUES(5260,'3804800','[Etori] Ero Trap ga Dekiru made | 에로 트랩이 완성되기까지 [Korean]','Doujinshi','https://e-hentai.org/g/3804800/75d1ac8d44/',1771916239);
INSERT INTO "new-item-list" VALUES(5261,'3804799','[Etori] Sister no Himitsu | 수녀님의 비밀 [Korean]','Doujinshi','https://e-hentai.org/g/3804799/b1be3158d2/',1771916239);
INSERT INTO "new-item-list" VALUES(5262,'3804798','[Etori] Boku wa Suit o Kita Onaho desu | 저는 정장을 입은 암컷 오나홀입니다 [Korean]','Doujinshi','https://e-hentai.org/g/3804798/7a48755e43/',1771916239);
INSERT INTO "new-item-list" VALUES(5263,'3804659','[GENJU MINZOKU (Sato) ] Shanai no Himegoto ~Stress Kaishou ni Kaisha no Toilet de Onani shite itara, Kouhai ni Kikarete shimatte ita Hanashi~ | 사내의 비밀～스트레스 해소를 위해 회사 화장실에서 자위하고 있었는데, 후배에게 들켜버린 이야기～ [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3804659/13e2f98b7d/',1771916239);
INSERT INTO "new-item-list" VALUES(5264,'3804651','(Kemoket 16) [CandleLight (Suigi)] Shiharai wa MyBody de! [Korean]','Doujinshi','https://e-hentai.org/g/3804651/aa1614aa82/',1771916239);
INSERT INTO "new-item-list" VALUES(5265,'3804634','[Pairesshu] Kyouiku Mama o Iinarinishite Sex Shita Hanashi | 교육열이 높은 엄마를 복종시켜 섹스한 이야기 [Korean]','Doujinshi','https://e-hentai.org/g/3804634/b1d4cdeeeb/',1771916239);
INSERT INTO "new-item-list" VALUES(5266,'3804628','[Yachou (Bloiler Yachou)] Ichiryuu Sennyuu Sousakan Haiboku [Korean]','Doujinshi','https://e-hentai.org/g/3804628/556d375409/',1771916239);
INSERT INTO "new-item-list" VALUES(5267,'3804534','[Bubo] 더위때문이야 (Genshin Impact) [Korean]','Doujinshi','https://e-hentai.org/g/3804534/206886e8d2/',1771916239);
INSERT INTO "new-item-list" VALUES(5268,'3804302','[Double Deck] 해후 邂逅-KAIKOU-','Doujinshi','https://e-hentai.org/g/3804302/9870ac7f97/',1771916239);
INSERT INTO "new-item-list" VALUES(5269,'3804214','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 7 | 용사님은 보수로 유부녀를 희망합니다 7 [Korean] [Digital]','Manga','https://e-hentai.org/g/3804214/6615e830be/',1771916239);
INSERT INTO "new-item-list" VALUES(5270,'3804093','[heppari] Loremaster Comics ch.1-36 [Korean][ongoing]','Non-H','https://e-hentai.org/g/3804093/f919d315c9/',1771916239);
INSERT INTO "new-item-list" VALUES(5271,'3804062','[horori] Z.Z.Z Gravure #5: YIXUAN & YeShunguang (Zenless Zone Zero) [Korean]','Doujinshi','https://e-hentai.org/g/3804062/7e23727bfe/',1771916239);
INSERT INTO "new-item-list" VALUES(5272,'3804043','[horori] Z.Z.Z Gravure #4: NICOLE & MIYABI (Zenless Zone Zero) [Korean]','Doujinshi','https://e-hentai.org/g/3804043/bd3e0d77ea/',1771916239);
INSERT INTO "new-item-list" VALUES(5273,'3803753','[Kuishinbou (Naitou Haruto)] Aisuru Tsuma ga Zetsurin Shachou no Te ni Ochita Sono Hi 2 | 사랑하는 아내가 절륜 사장의 손에 함락된 그날 2 [Korean]','Doujinshi','https://e-hentai.org/g/3803753/631abb3586/',1771916239);
INSERT INTO "new-item-list" VALUES(5274,'3803589','[Meganeru / Cherachera] メガネル FANBOX - FULL GALLERY (Updated 2026.02.11)','Image Set','https://e-hentai.org/g/3803589/20ead48b7c/',1771916239);
INSERT INTO "new-item-list" VALUES(5275,'3803384','[Pixiv] Daram (72603788) [23.11 - ]','Image Set','https://e-hentai.org/g/3803384/5b85d1d2c4/',1771916239);
INSERT INTO "new-item-list" VALUES(5276,'3803358','[Yurishima Shiro] ZokuZoku·Class ni Hitori dakeno Joshi | 속속·반에서 하나뿐인 여자 [Korean]','Doujinshi','https://e-hentai.org/g/3803358/6dda05099f/',1771916239);
INSERT INTO "new-item-list" VALUES(5277,'3803249','[Idaten Funisuke] Polynesian Sex de Gaman Dekinai Tsuma | 폴리네시안 섹스를 참지 못한 아내 [Korean]','Doujinshi','https://e-hentai.org/g/3803249/d988dea214/',1771916239);
INSERT INTO "new-item-list" VALUES(5278,'3803196','[mabo] Kemo Gokoro mo Hogusare Massage [Korean] [LWND]','Manga','https://e-hentai.org/g/3803196/9ba8495755/',1771916239);
INSERT INTO "new-item-list" VALUES(5279,'3803186','[Suruga Kreuz] Diet Hasumi | 다이어트 하스미 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3803186/116c9b9646/',1771916239);
INSERT INTO "new-item-list" VALUES(5280,'3803180','[BoriKori]moderately risky.3','Doujinshi','https://e-hentai.org/g/3803180/a4d3d898d1/',1771916239);
INSERT INTO "new-item-list" VALUES(5281,'3803147','[Kuusou Shoujo (Sutora)] Otsukare desu ka? Aruji-dono! | 피곤하신가요? 주군! (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3803147/eba2469a76/',1771916239);
INSERT INTO "new-item-list" VALUES(5282,'3803139','[Kuusou Shoujo (Sutora)] Sensei, Yoru wa Issho ni... Itekureru? | 선생님, 밤에는... 같이 있어 줄래? (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3803139/eb1a48dac0/',1771916239);
INSERT INTO "new-item-list" VALUES(5283,'3802981','[いちのせ] オナホ姉[Textless]','Doujinshi','https://e-hentai.org/g/3802981/5516da9000/',1771916239);
INSERT INTO "new-item-list" VALUES(5284,'3802949','[Tokupyon] C106 New Release Bonus Book BAD END HEAVEN 6 part0.9','Doujinshi','https://e-hentai.org/g/3802949/884662169d/',1771916239);
INSERT INTO "new-item-list" VALUES(5285,'3802829','(C106) [chested (Tokupyon)] BAD END HEAVEN 6 part1 (Mushoku Tensei ~Isekai Ittara Honki Dasu~) [Korean]','Doujinshi','https://e-hentai.org/g/3802829/4f30293549/',1771916239);
INSERT INTO "new-item-list" VALUES(5286,'3802753','[Ichinose] Onaho Ane [Korean]','Doujinshi','https://e-hentai.org/g/3802753/3878882812/',1771916239);
INSERT INTO "new-item-list" VALUES(5287,'3802707','[BANG-YOU] Shidoukan Video | 지도간 Video (VS 거근 아저씨) [Korean] [Digital]','Manga','https://e-hentai.org/g/3802707/69b7d57051/',1771916239);
INSERT INTO "new-item-list" VALUES(5288,'3802666','[Teruism (Terubouzu)] Futanari Quartette | 후타나리 콰르텟 [Korean] [도레솔] [Digital]','Doujinshi','https://e-hentai.org/g/3802666/9b76df656f/',1771916239);
INSERT INTO "new-item-list" VALUES(5289,'3802662','[Sha~ no Futa (Sharaku Kaede)] Kyuu ni Chinpo ga Haetekita Mitsuki-san 2 Himitsu no Shasei Gasshuku!! | 갑자기 자지가 돋아난 미츠키 씨 2 비밀의 사정합숙!! [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3802662/9997d5b091/',1771916239);
INSERT INTO "new-item-list" VALUES(5290,'3802659','[Sha~ no Futa (Sharaku Kaede)] Kyuu ni Chinpo ga Haetekita Mitsuki-san ga Class no Yankee Onna ni Hamemakuru Hanashi  | 갑자기 자지가 돋아난 미츠키 씨가 반의 양키 여자를 마구 따먹는 이야기 [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3802659/e55118ddce/',1771916239);
INSERT INTO "new-item-list" VALUES(5291,'3802497','[000_0200] Mahou Shoujo Ni Akogarete works','Image Set','https://e-hentai.org/g/3802497/da780c982d/',1771916239);
INSERT INTO "new-item-list" VALUES(5292,'3801849','[Idaten Funisuke] Kenka-chuu ni a OnaBare | 싸우는 도중에 자위 들키기 [Korean]','Manga','https://e-hentai.org/g/3801849/185464422c/',1771916239);
INSERT INTO "new-item-list" VALUES(5293,'3801767','[Riku no Kotoutei (Shayo)] Oushun Jogakuen no Danyuu 4 | 오우슌 여학원의 남자배우 4 [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3801767/43523fb72e/',1771916239);
INSERT INTO "new-item-list" VALUES(5294,'3801766','[Ringoya (Alp)] Otaku Tomodachi to no Sex wa Saikou ni Kimochi Ii 2  오타쿠 친구랑 하는 섹스는 최고로 기분 좋다2 [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3801766/083d96fac9/',1771916239);
INSERT INTO "new-item-list" VALUES(5295,'3801736','[Kisaki Noah] Okitsune-sama Konnichiwa (COMIC ExE 65) [Korean] [Digital]','Manga','https://e-hentai.org/g/3801736/5bc8f26107/',1771916239);
INSERT INTO "new-item-list" VALUES(5296,'3801713','[sunhyun] Kei (Blue Archive) [Japanese, Korean]','Artist CG','https://e-hentai.org/g/3801713/c0ebc360c7/',1771916239);
INSERT INTO "new-item-list" VALUES(5297,'3801580','[fusuma] MkKo Tomodachi | M과 친구들[Korean]','Doujinshi','https://e-hentai.org/g/3801580/7f5ed0b038/',1771916239);
INSERT INTO "new-item-list" VALUES(5298,'3801383','[Anon''s Flood Myth (Anon 2-okunen)] Bokutachi, Seiheki Friend. ~Onna Tomodachi no Aidokusho wa Ore no Daisuki na ''Chin Kagi Ero Manga'' deshita~ Zenpen | 우리들, 성벽 프렌드. ~여자 사람 친구의 애독서는 내가 엄청 좋아하는 "좆냄새 맡는 야한 만화" 였습니다 [Korean] [Non-glasses]','Doujinshi','https://e-hentai.org/g/3801383/eb2edbef46/',1771916239);
INSERT INTO "new-item-list" VALUES(5299,'3801379','[Anon''s Flood Myth (Anon 2-okunen)] Bokutachi, Seiheki Friend. ~Onna Tomodachi no Aidokusho wa Ore no Daisuki na ''Chin Kagi Ero Manga'' deshita~ Zenpen | 우리들, 성벽 프렌드. ~여자 사람 친구의 애독서는 내가 엄청 좋아하는 "좆냄새 맡는 야한 만화" 였습니다 [Korean]','Doujinshi','https://e-hentai.org/g/3801379/af7b99c4a4/',1771916239);
INSERT INTO "new-item-list" VALUES(5300,'3801296','[Osuwaani] Request Itadaita Mono desu (Mobile Suit Gundam SEED) [Korean]','Doujinshi','https://e-hentai.org/g/3801296/2b0eb081f0/',1771916239);
INSERT INTO "new-item-list" VALUES(5301,'3801241','[Nakamachi Machi] Bunny Marriage Daisakusen (COMIC Kairakuten BEAST 2026-01) [Korean] [Digital]','Manga','https://e-hentai.org/g/3801241/9421f3e646/',1771916239);
INSERT INTO "new-item-list" VALUES(5302,'3801203','(COMIC1☆1) [EINSATZ GRUPPE (Charlie Nishinaka)] N 0.1 WHITE DEVIL (Mahou Shoujo Lyrical Nanoha A''s) [korean]','Non-H','https://e-hentai.org/g/3801203/045aba1d3b/',1771916239);
INSERT INTO "new-item-list" VALUES(5303,'3801046','마법소녀 리리컬 나노하 EXCEEDS (02)','Non-H','https://e-hentai.org/g/3801046/fc21275a4d/',1771916239);
INSERT INTO "new-item-list" VALUES(5304,'3800929','[TCA Cycle (Gairou)] Homura to Ichinichijuu H Shimakuru Hon | 호무라랑 하루종일 H하는 책 (Xenoblade Chronicles 2) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3800929/c58d963a47/',1771916239);
INSERT INTO "new-item-list" VALUES(5305,'3800910','[Syunichi Kansuu (Syunichi)] Gachihame SEX Shidou Soushuuhen | 진심교배 SEX지도 총집편 [Korean] [Team Edge] [Digital]','Doujinshi','https://e-hentai.org/g/3800910/314b7e84c7/',1771916239);
INSERT INTO "new-item-list" VALUES(5306,'3800897','[Tamagou] Tenchou tte, Kyonyuu de Chotto M desu yo ne? 2 | 점장님은, 거유에 살짝 M이죠? 2 [Korean]','Doujinshi','https://e-hentai.org/g/3800897/56ef7be902/',1771916239);
INSERT INTO "new-item-list" VALUES(5307,'3800822','[Kuusou Shoujo (Sutora)] Goshujin-sama! Asuna-tachi ni Makasete! | 주인님! 아스나 일행에게 맡겨줘! (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3800822/b8da6b91aa/',1771916239);
INSERT INTO "new-item-list" VALUES(5308,'3800552','[OTOMEKIBUN (Sansyoku Amido.)] Manager-chan Shidouchuu! | 매니저 짱 지도중! [Korean]','Doujinshi','https://e-hentai.org/g/3800552/0cd22de458/',1771916239);
INSERT INTO "new-item-list" VALUES(5309,'3800528','[Botandou (Kio Shimoku)] Zenbu, Sensei no Sei. 2 Kouhen Futanari Jokyoushi ga Seiyoku Bakuhatsu Oyako o Sukkiri Saseru Hanashi. | 전부, 선생님 탓. 2 후편 후타나리 여교사가 성욕폭발 모녀를 개운하게 하는 이야기. [Korean] [도레솔]','Doujinshi','https://e-hentai.org/g/3800528/b5d9d8d98b/',1771916239);
INSERT INTO "new-item-list" VALUES(5310,'3800361','[Narushima Godou] Dekkai Chinko de Suki Houdai | 대물 자지로 마음껏 [Korean] [Digital]','Manga','https://e-hentai.org/g/3800361/4de95eb3c6/',1771916239);
INSERT INTO "new-item-list" VALUES(5311,'3800123','[vanslaw] NO MORE SECRETS - Chapter 2 - Shower Time Fun |  더 이상 비밀은 없다 - 제2장 - 즐거운 샤워 시간[Korean][팀 숙녀][AI Generated]','Misc','https://e-hentai.org/g/3800123/e86f4f2b24/',1771916239);
INSERT INTO "new-item-list" VALUES(5312,'3800118','[Scarlett Ann] Dear Clara (Halloween Special - Trick or Treat) [Korean][팀 숙녀]','Western','https://e-hentai.org/g/3800118/b5a91a3190/',1771916239);
INSERT INTO "new-item-list" VALUES(5313,'3800114','[Garriguex] Bloodline Depravity | 타락의 혈통[Korean][팀 숙녀]','Western','https://e-hentai.org/g/3800114/3de6f80bb7/',1771916239);
INSERT INTO "new-item-list" VALUES(5314,'3800113','[Akikan] Boshi Seikyouiku Gimu-ka Houan Shimosato-ka | 모자 성교육 의무화법 시모사토 가문[Korean][팀 숙녀] [Digital]','Doujinshi','https://e-hentai.org/g/3800113/d854fd1327/',1771916239);
INSERT INTO "new-item-list" VALUES(5315,'3800105','[gonza] Shin Tomodachi no Hahaoya (Ge) ch. 13-15 | 신 친구엄마 제13-15화 [Digital][Korean][팀 숙녀][Ongoing]','Manga','https://e-hentai.org/g/3800105/2dfd39c39c/',1771916239);
INSERT INTO "new-item-list" VALUES(5316,'3799972','[Michiking] Ane Taiken Jogakuryou End Collection + Sister''s Art Archive ｜ 누나 체험 여자기숙사 End Collection (Ane Taiken Jogakuryou ~Limited Edition~) [Korean] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3799972/bbc57ff08e/',1771916239);
INSERT INTO "new-item-list" VALUES(5317,'3799931','[Circle- AV] Pretty Heroine Time Vol. 4','Doujinshi','https://e-hentai.org/g/3799931/0149ab66de/',1771916239);
INSERT INTO "new-item-list" VALUES(5318,'3799919','[Kyouka Asuka] Batsu Game Sex Toka Iu Gohoubi  (COMIC Kairakuten BEAST 2026-02) [Korean] [팀 털난보리]  [Digital]','Manga','https://e-hentai.org/g/3799919/ddf1308a1b/',1771916239);
INSERT INTO "new-item-list" VALUES(5319,'3799901','[Hawk Bit (Kouji)] Party Tsuihou sareta TS Succubus-san wa Fukushuu ni Shippai suru | 파티에서 추방된 TS서큐버스는 복수에 실패한다 [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3799901/1c158e012d/',1771916239);
INSERT INTO "new-item-list" VALUES(5320,'3799773','[Toku] Joshidai no Ouji-sama Position nanoni Taikei Daradara na Ko | 여대에서 왕자님 포지션인데 몸매는 늘어진 타입의 아이 [Korean]','Doujinshi','https://e-hentai.org/g/3799773/52d418e200/',1771916239);
INSERT INTO "new-item-list" VALUES(5321,'3799697','브레머튼','Doujinshi','https://e-hentai.org/g/3799697/50113209a0/',1771916239);
INSERT INTO "new-item-list" VALUES(5322,'3799608','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 6 | 용사님은 보수로 유부녀를 희망합니다 6 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799608/26322e4cd7/',1771916239);
INSERT INTO "new-item-list" VALUES(5323,'3799607','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 5 | 용사님은 보수로 유부녀를 희망합니다 5 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799607/8192179895/',1771916239);
INSERT INTO "new-item-list" VALUES(5324,'3799606','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 4 | 용사님은 보수로 유부녀를 희망합니다 4 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799606/40c64fbe5b/',1771916239);
INSERT INTO "new-item-list" VALUES(5325,'3799605','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu  - The hero wants a married woman as a reward   3  | 용사님은 보수로 유부녀를 희망합니다 3 [Korean] [Digital]','Manga','https://e-hentai.org/g/3799605/e324d1b41e/',1771916239);
INSERT INTO "new-item-list" VALUES(5326,'3799604','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 2  | 용사님은 보수로 유부녀를 희망합니다 2 [Korean]  [Digital]','Manga','https://e-hentai.org/g/3799604/1c8c23dc2d/',1771916239);
INSERT INTO "new-item-list" VALUES(5327,'3799603','[Toyama Burin] Yuusha-sama wa Houshuu ni Hitozuma o Gokibou desu - The hero wants a married woman as a reward 1 | 용사님은 보수로 유부녀를 희망합니다 1 [Korean]  [Digital]','Manga','https://e-hentai.org/g/3799603/2a2c694569/',1771916239);
INSERT INTO "new-item-list" VALUES(5328,'3799598','[Studio TAGATA (Yontarou)] Dluminia Oukoku Monogatari 「Onna-Shogun no Zetsubo no Netsubo」｜달미니아 왕국 이야기 「여장군의 절망의 열망」[Korean]','Doujinshi','https://e-hentai.org/g/3799598/8edba2f4ed/',1771916239);
INSERT INTO "new-item-list" VALUES(5329,'3799332','[Glycogen] Ooya-san wa Osewa ga Osuki♡ (COMIC ExE 67) [Korean] [Digital]','Manga','https://e-hentai.org/g/3799332/24f3035a70/',1771916239);
INSERT INTO "new-item-list" VALUES(5330,'3799282','마법천자문 45-52권','Non-H','https://e-hentai.org/g/3799282/f5ad258837/',1771916239);
INSERT INTO "new-item-list" VALUES(5331,'3799123','[Sagattoru] Onna Banchou Saraiyari Shikyuu Uzuite Tomerannee | 여번장 납치강간 "자궁"이 욱신거려서 "멈출" 수 없어 (ANGEL Club 2016-11) [Korean] [Digital]','Manga','https://e-hentai.org/g/3799123/38b25b1332/',1771916239);
INSERT INTO "new-item-list" VALUES(5332,'3798895','chihel图集','Doujinshi','https://e-hentai.org/g/3798895/a0e66f6eb5/',1771916239);
INSERT INTO "new-item-list" VALUES(5333,'3798887','[Yesman] Sayonara Jinja | 잘 가 신사 (COMIC Shingeki 2024-12) [Korean] [Digital]','Manga','https://e-hentai.org/g/3798887/591414476d/',1771916239);
INSERT INTO "new-item-list" VALUES(5334,'3798369','[Kyaradain] Saimin de Otokonoko o Onnanoko ni Shichau Hon | 최면으로 남자애를 여자애로 만들어 버리는 책 [Korean]','Doujinshi','https://e-hentai.org/g/3798369/14bf2126cb/',1771916239);
INSERT INTO "new-item-list" VALUES(5335,'3798125','(C71) [Circle AV (Minazuki Ayu)] 미소녀전사 한정 프리티 히로인타임 Vol. 6 (파워레인저 트레저포스)','Doujinshi','https://e-hentai.org/g/3798125/fa2c1068b4/',1771916239);
INSERT INTO "new-item-list" VALUES(5336,'3798034','[Super Ichigo-chan (Misaoka)] Kanojo o Netorareta Kedo Boku wa Shiawase ni Narimasu | 여친을 빼앗겼지만 저는 행복해질 겁니다 [Korean]','Doujinshi','https://e-hentai.org/g/3798034/59315b433e/',1771916239);
INSERT INTO "new-item-list" VALUES(5337,'3797968','[Doukutsu Tamago] Cosplay Osananajimi (COMIC BAVEL 2026-02) [Korean] [Digital] [Decensored]','Manga','https://e-hentai.org/g/3797968/e58f470049/',1771916239);
INSERT INTO "new-item-list" VALUES(5338,'3797955','[Doukutsu Tamago] Cosplay Osananajimi (COMIC BAVEL 2026-02) [Korean] [Digital]','Manga','https://e-hentai.org/g/3797955/5be34774ca/',1771916239);
INSERT INTO "new-item-list" VALUES(5339,'3797938','[Takaman] Kaga [Korean]','Doujinshi','https://e-hentai.org/g/3797938/21a1e2364e/',1771916239);
INSERT INTO "new-item-list" VALUES(5340,'3797891','[Torii Yoshitsuna] Himadashi Onanie demo Suru ka! | 지루하니 자위라도 할까! [Korean]','Doujinshi','https://e-hentai.org/g/3797891/73bb604f4f/',1771916239);
INSERT INTO "new-item-list" VALUES(5341,'3797714','[Jewel] Hitozuma o Saimin de Kyousei shite Mama ni suru | 유부녀를 최면으로 교정해 엄마로 만들기 [Korean]','Artist CG','https://e-hentai.org/g/3797714/cf753bcfd6/',1771916239);
INSERT INTO "new-item-list" VALUES(5342,'3797712','(C104) [Mentaipark (Yamamoto)] Misono Houshi | 미소노 봉사 (Blue Archive) [Korean]','Doujinshi','https://e-hentai.org/g/3797712/50a4055192/',1771916239);
INSERT INTO "new-item-list" VALUES(5343,'3797711','[EARRINGS BOM FACTORY (ICHIGAIN)] Wakasa Yue no Ayamachi!? | 와카사 때문에 벌어진 실수!? (Blue Archive) [Korean] [Robeta] [Digital]','Doujinshi','https://e-hentai.org/g/3797711/74d2476f82/',1771916239);
INSERT INTO "new-item-list" VALUES(5344,'3797710','[Atelier Hinata (Hinata Yuu)] Miyo no Okusuri Delivery (Blue Archive) [Korean] [Digital]','Doujinshi','https://e-hentai.org/g/3797710/ac88a58ce5/',1771916239);
INSERT INTO "new-item-list" VALUES(5345,'3797705','[Isenori] Class no Anoko wa Ningen o Yameta Ushinyuu Benjo 5 | 교실의 그 아이는 인간을 그만둔 젖소가슴 변기녀 5 [Korean]','Doujinshi','https://e-hentai.org/g/3797705/1613359095/',1771916239);
INSERT INTO "new-item-list" VALUES(5346,'3797696','[Daiichi Yutakasou (Chiku)] Kanojo o Netorase Fuuzoku ni Nante Tsurete-kun ja Nakatta 2.5 | 여친을 네토라세 풍속에 데려가는게 아니었는데 2.5 [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3797696/a3b23d0ba5/',1771916239);
INSERT INTO "new-item-list" VALUES(5347,'3797671','[Labomagi! (Takeda Aranobu)] H na Onee-san wa, Suki desu ka? 6 ~Harabote Polynesian Sex to Shinkon Shoya to Anal Haka~ | 야한 누나는 좋아하나요？6 ~배불뚝이 폴리네시안 섹스와 신혼초야와 애널 파과~ [Korean]','Doujinshi','https://e-hentai.org/g/3797671/177e3e73bc/',1771916239);
INSERT INTO "new-item-list" VALUES(5348,'3797626','마법천자문 구판 12-22권','Non-H','https://e-hentai.org/g/3797626/bf87bda71d/',1771916239);
INSERT INTO "new-item-list" VALUES(5349,'3797625','마법천자문 구판 1-11권','Non-H','https://e-hentai.org/g/3797625/593d08e608/',1771916239);
INSERT INTO "new-item-list" VALUES(5350,'3797491','[Minamida Usuke] Dokidoki Occult Kenkyuubu | 두근두근 오컬트 연구부 (두근두근♡폭유 사모님이 너무 야해서!)[Korean] [Digital]','Manga','https://e-hentai.org/g/3797491/c5898f66f0/',1771916239);
INSERT INTO "new-item-list" VALUES(5351,'3797487','[Michiking] Bitch Slump Azato-san | 빗치 슬럼프 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797487/000436de43/',1771916239);
INSERT INTO "new-item-list" VALUES(5352,'3797467','[Michiking] Koushoku Henshuu Azato-san | 호색편집 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797467/d083781acf/',1771916239);
INSERT INTO "new-item-list" VALUES(5353,'3797465','[Michiking] Shouwaru Henshuu Azato-san | 사악편집 아자토씨 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797465/5475ef7eb2/',1771916239);
INSERT INTO "new-item-list" VALUES(5354,'3797347','[Michiking] Azato Making | 아자토 메이킹 (Azato Making) [Korean] [Decensored]','Doujinshi','https://e-hentai.org/g/3797347/61bee3e2f0/',1771916239);
INSERT INTO "new-item-list" VALUES(5355,'3797318','[Takuroodo (Takurowo)] Ikinari kon -After Story- | 갑작스런 결혼 -After Story- [Digital]','Doujinshi','https://e-hentai.org/g/3797318/706af0fedc/',1771916239);
INSERT INTO "new-item-list" VALUES(5356,'3796974','[Kuusou Shoujo (Sutora)] Kirara de Love Love suru Hon | 키라라로 응애응애 하는 책 (Blue Archive) [Korean] [Reminiscencely] [Digital]','Doujinshi','https://e-hentai.org/g/3796974/45e06208ae/',1771916239);
INSERT INTO "new-item-list" VALUES(5357,'3796710','(Reitaisai 15) [Anmitsuyomogitei (Michiking)] ANMITSU TOUHOU THE AFTER Vol. 1 | 안미츠 동방 더 애프터 Vol. 1 (Touhou Project) [Korean] [느와카나] [Decensored]','Doujinshi','https://e-hentai.org/g/3796710/3192c2c63b/',1771916239);
INSERT INTO "new-item-list" VALUES(5358,'3796681','(Kemokko Lovers 5) [Mayoineko (Nezumin)] Inuman 2 - Oinu-sama | 멍멍이 님 [Korean]','Doujinshi','https://e-hentai.org/g/3796681/6227f78ebd/',1771916239);
INSERT INTO "new-item-list" VALUES(5359,'3796622','[Michiking] Ane Taiken Shuukan | 누나체험 주간  [Korean] [Liberty Library] [Digital] [Decensored]','Doujinshi','https://e-hentai.org/g/3796622/20bc697d33/',1771916239);
INSERT INTO "new-item-list" VALUES(5360,'3796446','[Doukutsu Tamago] Sokubaku mariage (COMIC BAVEL 2025-11) [Korean] [Digital]','Manga','https://e-hentai.org/g/3796446/92de71b83b/',1771916239);
INSERT INTO "new-item-list" VALUES(5361,'3796445','[Doukutsu Tamago] Sokubaku mariage (COMIC BAVEL 2025-11) [Korean] [Digital] [Decensored]','Manga','https://e-hentai.org/g/3796445/f8f6a44460/',1771916239);
INSERT INTO "new-item-list" VALUES(5362,'3796426','Sakiko-san no kantuu moyo ＃2 (AI Generated) [korean] : 사키코씨의 간통사정 2','Misc','https://e-hentai.org/g/3796426/c637b9070a/',1771916239);
INSERT INTO "new-item-list" VALUES(5363,'3796424','[Corundum] Seikyouiku Jisshuu de Naka no Warui Danjo ga Kumasareru Hanashi | 성교육 실습에서 사이 나쁜 남녀가 짝이 된 이야기 [Korean]','Doujinshi','https://e-hentai.org/g/3796424/f19f36968c/',1771916239);
INSERT INTO "new-item-list" VALUES(5364,'3796415','[Hardboiled Yoshiko] Elf no ShuuKatsu | 엘프의 종활 [Digital] [Korean]','Doujinshi','https://e-hentai.org/g/3796415/8ce90f797f/',1771916239);
INSERT INTO "new-item-list" VALUES(5365,'3796388','[Boole] 날 괴롭히던 육덕일진녀랑 동거 2 [Korean]','Doujinshi','https://e-hentai.org/g/3796388/5fef510243/',1771916239);
INSERT INTO "new-item-list" VALUES(5366,'3796343','[Boole] 마법소녀의 전남친 금태양 [Korean]','Doujinshi','https://e-hentai.org/g/3796343/9506367349/',1771916239);
INSERT INTO "new-item-list" VALUES(5367,'3796322','[Boole] 일진녀 2마리와 동거생활 [Korean]','Doujinshi','https://e-hentai.org/g/3796322/fc102877f0/',1771916239);
INSERT INTO "new-item-list" VALUES(5368,'3796274','[Fanbox] Kakyuu Bushi [Korean]','Doujinshi','https://e-hentai.org/g/3796274/51c1abbbbd/',1771916239);
INSERT INTO "new-item-list" VALUES(5369,'3796271','[Boole] 수정버전) 제 남친은 저를 오나홀로 대하지 않아요 [Korean]','Doujinshi','https://e-hentai.org/g/3796271/c122c2cb1d/',1771916239);
INSERT INTO "new-item-list" VALUES(5370,'3796255','[Boole] 이세계 섹스 라이프 [Korean]','Doujinshi','https://e-hentai.org/g/3796255/3975efe4cf/',1771916239);
CREATE TABLE IF NOT EXISTS "hitomi-crawl-state" (
     "key" text PRIMARY KEY NOT NULL,
     "lastStartedAt" integer,
     "lastCompletedAt" integer,
     "lastStatus" text DEFAULT 'idle' NOT NULL,
     "lastError" text,
     "lastDurationMs" integer,
     "lastCrawledCount" integer DEFAULT 0 NOT NULL,
     "lastSavedCount" integer DEFAULT 0 NOT NULL,
     "lastFailedCount" integer DEFAULT 0 NOT NULL,
     "updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
   );
INSERT INTO "hitomi-crawl-state" VALUES('global',1771916239,1771916242,'success',NULL,2277,125,125,0,1771916242);
CREATE TABLE IF NOT EXISTS "hitomi-crawl-lock" (
     "key" text PRIMARY KEY NOT NULL,
     "owner" text NOT NULL,
     "lockedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
     "expiresAt" integer NOT NULL
   );
CREATE TABLE IF NOT EXISTS "hitomi-crawl-rate-limit" (
     "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
     "scope" text NOT NULL,
     "key" text NOT NULL,
     "windowStart" integer NOT NULL,
     "count" integer DEFAULT 1 NOT NULL,
     "updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
   );
INSERT INTO "hitomi-crawl-rate-limit" VALUES(1,'ip','unknown',1771915800,1,1771916239);
INSERT INTO "hitomi-crawl-rate-limit" VALUES(2,'global','global',1771912800,1,1771916239);
CREATE TABLE IF NOT EXISTS "daily_check_items" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"title" text NOT NULL,
		"kind" text NOT NULL,
		"url" text NOT NULL,
		"notes" text,
		"estimatedMinutes" integer,
		"resetTime" text NOT NULL,
		"timeZone" text NOT NULL,
		"completionCycleKey" text,
		"completedAt" integer,
		"createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
		"updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	, "importance" text DEFAULT 'normal' NOT NULL, "resetTimes" text DEFAULT '["09:00"]' NOT NULL);
INSERT INTO "daily_check_items" VALUES(1,'Unlucid 코인 출석체크','site_visit','https://unlucid.ai/gems',NULL,1,'07:00','Asia/Seoul',NULL,NULL,1772067321,1772067321,'normal','["09:00"]');
INSERT INTO "daily_check_items" VALUES(2,'크랙 출석체크','site_visit','https://crack.wrtn.ai/cracker?tab=free',NULL,1,'06:00','Asia/Seoul','2026-02-26',1772068412,1772068083,1772068412,'normal','["09:00"]');
CREATE TABLE IF NOT EXISTS "daily_check_push_subscriptions" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"endpoint" text NOT NULL,
		"p256dh" text NOT NULL,
		"auth" text NOT NULL,
		"userAgent" text,
		"lastSuccessAt" integer,
		"lastError" text,
		"createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
		"updatedAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	);
CREATE TABLE IF NOT EXISTS "daily_check_notification_logs" (
		"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		"itemId" integer NOT NULL REFERENCES "daily_check_items"("id") ON DELETE CASCADE,
		"cycleKey" text NOT NULL,
		"channel" text DEFAULT 'web_push' NOT NULL,
		"sentAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL
	);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',16);
INSERT INTO "sqlite_sequence" VALUES('hitomi-history',5495);
INSERT INTO "sqlite_sequence" VALUES('new-item-list',5370);
INSERT INTO "sqlite_sequence" VALUES('hitomi-crawl-rate-limit',2);
INSERT INTO "sqlite_sequence" VALUES('daily_check_items',2);
CREATE UNIQUE INDEX "hitomi-history_code_unique" ON "hitomi-history" ("code");
CREATE INDEX "hitomi-history_createdAt_idx" ON "hitomi-history" ("createdAt");
CREATE UNIQUE INDEX "new-item-list_code_unique" ON "new-item-list" ("code");
CREATE INDEX "new-item-list_createdAt_idx" ON "new-item-list" ("createdAt");
CREATE UNIQUE INDEX "hitomi-crawl-rate-limit_scope_key_window_unique"
   ON "hitomi-crawl-rate-limit" ("scope", "key", "windowStart");
CREATE INDEX "hitomi-crawl-rate-limit_scope_window_idx"
   ON "hitomi-crawl-rate-limit" ("scope", "windowStart");
CREATE INDEX "daily_check_items_resetTime_idx" ON "daily_check_items" ("resetTime");
CREATE INDEX "daily_check_items_completionCycleKey_idx" ON "daily_check_items" ("completionCycleKey");
CREATE INDEX "daily_check_items_createdAt_idx" ON "daily_check_items" ("createdAt");
CREATE UNIQUE INDEX "daily_check_push_subscriptions_endpoint_unique"
		ON "daily_check_push_subscriptions" ("endpoint");
CREATE INDEX "daily_check_push_subscriptions_updatedAt_idx"
		ON "daily_check_push_subscriptions" ("updatedAt");
CREATE UNIQUE INDEX "daily_check_notification_logs_item_cycle_channel_unique"
		ON "daily_check_notification_logs" ("itemId", "cycleKey", "channel");
CREATE INDEX "daily_check_notification_logs_cycle_idx" ON "daily_check_notification_logs" ("cycleKey");
CREATE INDEX "daily_check_notification_logs_sentAt_idx" ON "daily_check_notification_logs" ("sentAt");
CREATE INDEX "daily_check_items_importance_idx" ON "daily_check_items" ("importance");