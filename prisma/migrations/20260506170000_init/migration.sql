-- CreateTable
CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "firstname" TEXT NOT NULL,
  "lastname" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'local',
  "providerId" TEXT,
  "profilePicture" TEXT,
  "age" INTEGER NOT NULL,
  "gender" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "verificationToken" TEXT,
  "passwordResetToken" TEXT,
  "passwordResetExpires" TIMESTAMP(3),
  "accountExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "userroles" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "roleId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "userroles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clubs" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "clubType" TEXT NOT NULL,
  "description" TEXT,
  "hostId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tournaments" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "entryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "discount" INTEGER NOT NULL DEFAULT 0,
  "tournamentTumbnail" TEXT,
  "location" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "registrationOpenDate" DATE NOT NULL,
  "registrationCloseDate" DATE NOT NULL,
  "status" TEXT NOT NULL,
  "organizerInfo" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "clubId" INTEGER NOT NULL,
  "hostId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "events" (
  "id" SERIAL NOT NULL,
  "eventName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "formats" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "formats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "groups" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bracketformats" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bracketformats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scoringlists" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scoringlists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playoffseedings" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playoffseedings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "brackets" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "maxTeams" INTEGER NOT NULL,
  "minAge" INTEGER DEFAULT 0,
  "maxAge" INTEGER DEFAULT 0,
  "minRating" INTEGER NOT NULL DEFAULT 0,
  "maxRating" INTEGER NOT NULL DEFAULT 0,
  "bracketFormatId" INTEGER NOT NULL,
  "scoringListId" INTEGER NOT NULL,
  "playoffSeedingId" INTEGER NOT NULL,
  "playoffMatchId" INTEGER,
  "semiFinalMatchId" INTEGER,
  "bronzeMatchId" INTEGER,
  "goldMatchId" INTEGER,
  "roundId" INTEGER,
  "tournamentId" INTEGER NOT NULL,
  "eventId" INTEGER NOT NULL,
  "poolStarted" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "registrationFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "brackets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teams" (
  "id" SERIAL NOT NULL,
  "teamName" TEXT,
  "bracketId" INTEGER NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'registered',
  "paymentStatus" TEXT DEFAULT 'paid',
  "isComplete" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teamplayers" (
  "id" SERIAL NOT NULL,
  "playerId" INTEGER NOT NULL,
  "teamId" INTEGER NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teamplayers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playerregistrations" (
  "id" SERIAL NOT NULL,
  "playerId" INTEGER NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "bracketId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'registered',
  "paymentStatus" TEXT NOT NULL DEFAULT 'paid',
  "checkInStatus" TEXT NOT NULL DEFAULT 'not_checked_in',
  "checkInTime" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playerregistrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playerbrackets" (
  "id" SERIAL NOT NULL,
  "playerId" INTEGER NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "bracketId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'registered',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playerbrackets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pool" (
  "id" SERIAL NOT NULL,
  "poolName" TEXT NOT NULL,
  "bracketId" INTEGER NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PoolTeam" (
  "poolId" INTEGER NOT NULL,
  "teamId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PoolTeam_pkey" PRIMARY KEY ("poolId","teamId")
);

CREATE TABLE "rounds" (
  "id" SERIAL NOT NULL,
  "poolId" INTEGER,
  "roundNumber" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "bracketId" INTEGER,
  "type" TEXT NOT NULL DEFAULT 'pool',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Matches" (
  "id" SERIAL NOT NULL,
  "team1Id" INTEGER NOT NULL,
  "team2Id" INTEGER NOT NULL,
  "poolId" INTEGER,
  "roundId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "scoreTeam1" INTEGER DEFAULT 0,
  "scoreTeam2" INTEGER DEFAULT 0,
  "type" TEXT DEFAULT 'pool',
  "winnerTeamId" INTEGER,
  "loserTeamId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "poolteamstats" (
  "id" SERIAL NOT NULL,
  "poolId" INTEGER NOT NULL,
  "teamId" INTEGER NOT NULL,
  "wins" INTEGER DEFAULT 0,
  "losses" INTEGER DEFAULT 0,
  "pointsFor" INTEGER DEFAULT 0,
  "pointsAgainst" INTEGER DEFAULT 0,
  "pointDifference" INTEGER DEFAULT 0,
  "pdPercent" DOUBLE PRECISION DEFAULT 0,
  "playoffSeed" INTEGER,
  "playoffWins" INTEGER DEFAULT 0,
  "playoffPointsFor" INTEGER DEFAULT 0,
  "playoffPointsAgainst" INTEGER DEFAULT 0,
  "playoffPointDifference" INTEGER DEFAULT 0,
  "finalRank" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "poolteamstats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "userroles_userId_roleId_key" ON "userroles"("userId","roleId");
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments"("slug");
CREATE UNIQUE INDEX "events_eventName_key" ON "events"("eventName");
CREATE UNIQUE INDEX "formats_name_key" ON "formats"("name");
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");
CREATE UNIQUE INDEX "bracketformats_name_key" ON "bracketformats"("name");
CREATE UNIQUE INDEX "scoringlists_name_key" ON "scoringlists"("name");
CREATE UNIQUE INDEX "teamplayers_playerId_teamId_key" ON "teamplayers"("playerId","teamId");
CREATE UNIQUE INDEX "poolteamstats_poolId_teamId_key" ON "poolteamstats"("poolId","teamId");
CREATE INDEX "poolteamstats_poolId_wins_pointDifference_idx" ON "poolteamstats"("poolId","wins","pointDifference");

ALTER TABLE "userroles" ADD CONSTRAINT "userroles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "userroles" ADD CONSTRAINT "userroles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_bracketFormatId_fkey" FOREIGN KEY ("bracketFormatId") REFERENCES "bracketformats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_scoringListId_fkey" FOREIGN KEY ("scoringListId") REFERENCES "scoringlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_playoffSeedingId_fkey" FOREIGN KEY ("playoffSeedingId") REFERENCES "playoffseedings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teamplayers" ADD CONSTRAINT "teamplayers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teamplayers" ADD CONSTRAINT "teamplayers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playerregistrations" ADD CONSTRAINT "playerregistrations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playerregistrations" ADD CONSTRAINT "playerregistrations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playerregistrations" ADD CONSTRAINT "playerregistrations_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PoolTeam" ADD CONSTRAINT "PoolTeam_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PoolTeam" ADD CONSTRAINT "PoolTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "brackets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "poolteamstats" ADD CONSTRAINT "poolteamstats_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "poolteamstats" ADD CONSTRAINT "poolteamstats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
