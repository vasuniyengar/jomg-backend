-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN "venue" TEXT;
ALTER TABLE "tournaments" ADD COLUMN "timezone" TEXT;
ALTER TABLE "tournaments" ADD COLUMN "refundDeadline" DATE;
ALTER TABLE "tournaments" ADD COLUMN "refundFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "tournaments" ADD COLUMN "duprRecorded" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tournaments" ADD COLUMN "duprEnforced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tournaments" ADD COLUMN "requireSkillRating" BOOLEAN NOT NULL DEFAULT false;
