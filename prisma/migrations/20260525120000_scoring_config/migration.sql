-- ScoringList structured rules + Bracket scoring snapshot
ALTER TABLE "scoringlists" ADD COLUMN IF NOT EXISTS "rules" JSONB;

ALTER TABLE "brackets" ADD COLUMN IF NOT EXISTS "scoringConfig" JSONB;
