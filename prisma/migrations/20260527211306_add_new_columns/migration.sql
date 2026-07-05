-- AlterTable
ALTER TABLE "brackets" ADD COLUMN     "division" TEXT;

-- AlterTable
ALTER TABLE "playerregistrations" ADD COLUMN     "clubName" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "playerRole" TEXT,
ADD COLUMN     "rosterNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "duprId" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT;
