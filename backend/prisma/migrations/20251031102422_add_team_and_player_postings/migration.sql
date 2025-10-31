-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('REQUESTED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."PostingStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."TeamInvitation" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."InvitationStatus" NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamPosting" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "rolesNeeded" "public"."LeagueRole"[],
    "status" "public"."PostingStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerPosting" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."PostingStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerPosting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPosting" ADD CONSTRAINT "TeamPosting_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerPosting" ADD CONSTRAINT "PlayerPosting_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
