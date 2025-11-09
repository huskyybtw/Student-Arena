/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."MatchType" AS ENUM ('Queue', 'Team');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."Lobby" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ranked" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "matchType" "public"."MatchType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LobbyPlayer" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "team" INTEGER NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "riotMatchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "winningTeam" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchParticipant" (
    "id" SERIAL NOT NULL,
    "championId" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "cs" INTEGER NOT NULL,
    "goldEarned" INTEGER NOT NULL,
    "items" INTEGER[],
    "spells" INTEGER[],
    "role" "public"."LeagueRole" NOT NULL,
    "puuid" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "lobbyPlayerId" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_lobbyId_key" ON "public"."Match"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_riotMatchId_key" ON "public"."Match"("riotMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_lobbyPlayerId_key" ON "public"."MatchParticipant"("lobbyPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tag_key" ON "public"."Team"("tag");

-- AddForeignKey
ALTER TABLE "public"."Lobby" ADD CONSTRAINT "Lobby_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."PlayerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyPlayer" ADD CONSTRAINT "LobbyPlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyPlayer" ADD CONSTRAINT "LobbyPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchParticipant" ADD CONSTRAINT "MatchParticipant_lobbyPlayerId_fkey" FOREIGN KEY ("lobbyPlayerId") REFERENCES "public"."LobbyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchParticipant" ADD CONSTRAINT "MatchParticipant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
