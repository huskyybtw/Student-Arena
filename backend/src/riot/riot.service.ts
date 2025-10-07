import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RiotPlayerMetadata } from './interfaces/riot-player-meta';
import { AccountDto } from './dto/account.dto';
import { SummonerDto } from './dto/summoner.dto';

@Injectable()
export class RiotService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://europe.api.riotgames.com';
  private readonly summonerBaseUrl = 'https://eun1.api.riotgames.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('RIOT_API_KEY')!;
  }

  /**
   * Fetches Riot account data by Riot ID (gameName and tagLine).
   * @param gameName The player's Riot game name
   * @param tagLine The player's Riot tag line
   * @returns Riot account data
   */
  async getAccountByGameName(
    gameName: string,
    tagLine: string,
  ): Promise<AccountDto> {
    const response = await firstValueFrom(
      this.httpService.get(
        `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          baseURL: this.baseUrl,
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }

  /**
   * Fetches Riot account data by PUUID.
   * @param puuid The player's PUUID
   * @returns Riot account data
   */
  async getAccountByPuuid(puuid: string): Promise<AccountDto> {
    const response = await firstValueFrom(
      this.httpService.get(
        `/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`,
        {
          baseURL: this.baseUrl,
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }

  /**
   * Fetches Riot summoner data by PUUID.
   * @param puuid The player's PUUID
   * @returns Riot summoner data
   */
  async getSummonerByPuuid(puuid: string): Promise<SummonerDto> {
    const response = await firstValueFrom(
      this.httpService.get(
        `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
        {
          baseURL: this.summonerBaseUrl,
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }

  /**
   * Fetches both account and summoner metadata for a given PUUID from Riot API.
   * Calls getAccountByPuuid and getSummonerByPuuid in parallel and returns both results.
   * @param puuid The player's PUUID
   * @returns An object containing account and summoner metadata
   */
  async getPlayerMetadataByPuuid(puuid: string): Promise<RiotPlayerMetadata> {
    const [account, summoner] = await Promise.all([
      this.getAccountByPuuid(puuid),
      this.getSummonerByPuuid(puuid),
    ]);
    return { account, summoner };
  }
}
