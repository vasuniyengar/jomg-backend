-- AlterTable
ALTER TABLE "Matches" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "courtNumber" INTEGER,
ADD COLUMN     "dreamBreakerRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dreamBreakerTeam1Score" INTEGER,
ADD COLUMN     "dreamBreakerTeam2Score" INTEGER,
ADD COLUMN     "dreamBreakerWinnerId" INTEGER,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PoolTeam" ADD COLUMN     "gamesLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchesLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchesWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsFor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seed" INTEGER;

-- CreateTable
CREATE TABLE "mlpmatchgames" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "gameNumber" INTEGER NOT NULL,
    "gameType" TEXT NOT NULL,
    "team1Player1Id" INTEGER NOT NULL,
    "team1Player2Id" INTEGER NOT NULL,
    "team2Player1Id" INTEGER NOT NULL,
    "team2Player2Id" INTEGER NOT NULL,
    "team1Score" INTEGER NOT NULL DEFAULT 0,
    "team2Score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "winnerTeamId" INTEGER,
    "winnerSide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mlpmatchgames_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mlpmatchgames_matchId_gameNumber_key" ON "mlpmatchgames"("matchId", "gameNumber");

-- AddForeignKey
ALTER TABLE "mlpmatchgames" ADD CONSTRAINT "mlpmatchgames_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
