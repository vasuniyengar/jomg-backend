-- Convert gameType from text to int (1=WD … 5=DB); drop gameNumber

ALTER TABLE "Matches" ADD COLUMN IF NOT EXISTS "gameTypeInt" INTEGER;

UPDATE "Matches"
SET "gameTypeInt" = "gameNumber"
WHERE "gameNumber" IS NOT NULL AND "gameTypeInt" IS NULL;

UPDATE "Matches" SET "gameTypeInt" = 1
WHERE "gameTypeInt" IS NULL AND "gameType" IS NOT NULL AND lower("gameType"::text) IN ('wd', '1');
UPDATE "Matches" SET "gameTypeInt" = 2
WHERE "gameTypeInt" IS NULL AND "gameType" IS NOT NULL AND lower("gameType"::text) IN ('md', '2');
UPDATE "Matches" SET "gameTypeInt" = 3
WHERE "gameTypeInt" IS NULL AND "gameType" IS NOT NULL AND lower("gameType"::text) IN ('x1', '3');
UPDATE "Matches" SET "gameTypeInt" = 4
WHERE "gameTypeInt" IS NULL AND "gameType" IS NOT NULL AND lower("gameType"::text) IN ('x2', '4');
UPDATE "Matches" SET "gameTypeInt" = 5
WHERE "gameTypeInt" IS NULL AND "gameType" IS NOT NULL AND lower("gameType"::text) IN ('db', '5');

UPDATE "Matches" SET "gameTypeInt" = 1
WHERE "gameTypeInt" IS NULL AND "poolId" IS NOT NULL;

ALTER TABLE "Matches" DROP COLUMN IF EXISTS "gameNumber";
ALTER TABLE "Matches" DROP COLUMN IF EXISTS "gameType";
ALTER TABLE "Matches" RENAME COLUMN "gameTypeInt" TO "gameType";
