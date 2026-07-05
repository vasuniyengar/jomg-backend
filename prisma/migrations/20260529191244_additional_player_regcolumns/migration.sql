/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `playerregistrations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "playerregistrations" DROP COLUMN "paymentMethod",
ADD COLUMN     "division" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT;
