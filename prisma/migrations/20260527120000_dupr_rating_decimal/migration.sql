-- Division DUPR range and player DUPR rating as decimals
ALTER TABLE "brackets" ALTER COLUMN "minRating" TYPE DECIMAL(4,2) USING "minRating"::decimal;
ALTER TABLE "brackets" ALTER COLUMN "maxRating" TYPE DECIMAL(4,2) USING "maxRating"::decimal;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "duprRating" DECIMAL(4,2);
