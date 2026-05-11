-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "initials" TEXT,
    "avatar" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT,
    "age" INTEGER,
    "date" DATE,
    "phone" TEXT,
    "partner" TEXT,
    "partnerId" TEXT,
    "division" TEXT,
    "dupr" DECIMAL(4,2),
    "paid" TEXT,
    "paidClass" TEXT,
    "status" TEXT,
    "statusClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");
