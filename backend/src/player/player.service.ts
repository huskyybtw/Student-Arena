import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiotService } from '../riot/riot.service';
import { CreatePlayerDto } from './dto/player-create.dto';
import { PlayerAccount, Prisma } from '@prisma/client';

/**
 * Service for player-related business logic.
 */
@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly riotService: RiotService,
  ) {}

  /**
   * Finds a player account by userId or puuid.
   * At least one filter must be provided.
   *
   * @param filters - Object with userId and/or puuid
   * @returns The found PlayerAccount or null if not found
   * @throws BadRequestException - If no filter is provided
   */
  async findOne(filters: { userId?: number; puuid?: string }) {
    if (!filters.userId && !filters.puuid) {
      throw new BadRequestException();
    }
    return this.prisma.playerAccount.findFirst({
      where: {
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(filters.puuid ? { puuid: filters.puuid } : {}),
      },
    });
  }

  /**
   * Updates a player's account data by userId.
   *
   * @param userId - The user's ID
   * @param input - The new player data (CreatePlayerDto)
   * @returns The updated PlayerAccount
   */
  async update(userId: number, input: CreatePlayerDto) {
    return this.prisma.playerAccount.update({
      where: { userId },
      data: input,
    });
  }

  /**
   * Creates a PlayerAccount for freashly created user.
   *
   * @param userId - The user's ID
   * @returns The created PlayerAccount
   */
  async preCreate(userId: number) {
    return this.prisma.playerAccount.create({
      data: { userId, description: '' },
    });
  }

  /**
   * Creates or updates a player account using Riot API data and stores it in the database.
   *
   * @param userId - The user's ID
   * @param input - The player's Riot data (CreatePlayerDto)
   * @returns The created or updated PlayerAccount
   * @throws BadRequestException - If creation fails or Riot API errors
   */
  async upsert(userId: number, input: CreatePlayerDto) {
    const { gameName, tagLine } = input;
    const account = await this.riotService.getAccountByGameName(
      gameName,
      tagLine,
    );
    const profile = await this.riotService.getSummonerByPuuid(account.puuid);

    const data = {
      ...input,
      puuid: account.puuid,
      profileIconId: profile.profileIconId,
      summonerLevel: profile.summonerLevel,
    };

    return await this.prisma.playerAccount.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  /**
   * Refreshes a player's account data from Riot API and updates the database record.
   * Finds the player by userId, fetches latest account and summoner data from Riot,
   * and updates the player account with the new data.
   *
   * @param userId - The user's ID
   * @returns The updated PlayerAccount
   * @throws BadRequestException - If player is not found or has no puuid
   */
  async refresh(userId: number) {
    const player = await this.prisma.playerAccount.findUnique({
      where: { userId },
    });
    if (!player?.puuid) {
      throw new BadRequestException('Player not found');
    }
    const response = await this.riotService.getPlayerMetadataByPuuid(
      player.puuid,
    );
    const { account, summoner } = response;
    return this.prisma.playerAccount.update({
      where: { userId },
      data: { ...account, ...summoner },
    });
  }
}
