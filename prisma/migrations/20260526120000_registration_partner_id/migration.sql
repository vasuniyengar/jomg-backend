-- Partner link on player registration (doubles check-in / team display)
ALTER TABLE "playerregistrations" ADD COLUMN IF NOT EXISTS "partnerId" INTEGER;

ALTER TABLE "playerregistrations"
  DROP CONSTRAINT IF EXISTS "playerregistrations_partnerId_fkey";

ALTER TABLE "playerregistrations"
  ADD CONSTRAINT "playerregistrations_partnerId_fkey"
  FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
