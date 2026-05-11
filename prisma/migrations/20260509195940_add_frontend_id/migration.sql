/*
  Warnings:

  - A unique constraint covering the columns `[frontendId]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "frontendId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "players_frontendId_key" ON "players"("frontendId");
