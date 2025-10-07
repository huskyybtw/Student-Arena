import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RiotService } from 'src/riot/riot.service';

/**
 * Service for player-related business logic.
 */
@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly riotService: RiotService,
  ) {}

  async create(userId: number, gameName: string, tagLine: string) {
    try {
      const account = await this.riotService.getAccountByGameName(
        gameName,
        tagLine,
      );
      const profile = await this.riotService.getSummonerByPuuid(account.puuid);
      
      const data = {
        userId,
        puuid: account.puuid ?? null,
        gameName: account.gameName ?? null,
        tagLine: account.tagLine ?? null,
        profileIconId: String(profile.profileIconId),
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
