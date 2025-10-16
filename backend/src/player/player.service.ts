import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiotService } from '../riot/riot.service';
import { CreatePlayerDto } from './dto/player-create.dto';

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
   * @param filters - Object with userId and/or puuid
   * @returns The found PlayerAccount or null if not found
   * @throws BadRequestException if no filter is provided
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
   * Updates a player's gameName and tagLine by userId.
   * @param userId - The user's ID
   * @param gameName - The new game name
   * @param tagLine - The new tag line
   * @returns The updated PlayerAccount
   */
  async update(userId: number, input: CreatePlayerDto) {
    return this.prisma.playerAccount.update({
      where: { userId },
      data: input,
    });
  }

  /**
   * Creates a new player account using Riot API data and stores it in the database.
   * @param userId - The user's ID
   * @param gameName - The player's Riot game name
   * @param tagLine - The player's Riot tag line
   * @returns The created PlayerAccount
   * @throws BadRequestException if creation fails or Riot API errors
   */
  async create(userId: number, input: CreatePlayerDto) {
    const { gameName, tagLine, primaryRole, secondaryRole } = input;
    try {
      const account = await this.riotService.getAccountByGameName(
        gameName,
        tagLine,
      );
      const profile = await this.riotService.getSummonerByPuuid(account.puuid);

      const data = {
        userId,
        ...input,
        profileIconId: profile.profileIconId,
        summonerLevel: profile.summonerLevel,
      };
      return await this.prisma.playerAccount.create({ data });
    } catch (error) {
      throw new BadRequestException(
        'Failed to create player: ' + (error?.message || 'Unknown error'),
      );
    }
  }
}
