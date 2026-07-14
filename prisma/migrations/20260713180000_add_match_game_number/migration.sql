-- AlterTable
ALTER TABLE "Matches" ADD COLUMN IF NOT EXISTS "gameNumber" INTEGER DEFAULT 1;
ALTER TABLE "Matches" ADD COLUMN IF NOT EXISTS "gameType" TEXT;

-- Backfill existing rows as single regulation games
UPDATE "Matches" SET "gameNumber" = 1 WHERE "gameNumber" IS NULL;
UPDATE "Matches" SET "gameType" = 'wd' WHERE "gameType" IS NULL AND "poolId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Matches_poolId_roundId_team1Id_team2Id_idx"
  ON "Matches"("poolId", "roundId", "team1Id", "team2Id");
