import {
  Injectable,
  HttpException,
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, NotFoundError } from 'rxjs';
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
   *
   * @param gameName - The player's Riot game name
   * @param tagLine - The player's Riot tag line
   * @returns Riot account data as AccountDto
   * @throws NotFoundException - If the account is not found or status is null
   * @throws BadRequestException - If the request is invalid (400)
   * @throws BadGatewayException - For other errors from Riot API
   */
  async getAccountByGameName(
    gameName: string,
    tagLine: string,
  ): Promise<AccountDto> {
    try {
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
    } catch (error: any) {
      const baseMessage = 'Failed to retrive data from riot service ';
      const message = error?.response?.data?.status?.message ?? '';
      const status = error?.response?.data?.status?.status_code;
      if (status === 404) {
        throw new NotFoundException(baseMessage + message);
      }
      if (status === 400) {
        throw new BadRequestException(baseMessage + message);
      }
      if (status == null) {
        throw new NotFoundException(baseMessage + message);
      }
      throw new BadGatewayException(baseMessage + message);
    }
  }

  /**
   * Fetches Riot account data by PUUID.
   *
   * @param puuid - The player's PUUID (will be URL encoded)
   * @returns Riot account data as AccountDto
   * @throws NotFoundException - If the account is not found or status is null
   * @throws BadRequestException - If the request is invalid (400)
   * @throws BadGatewayException - For other errors from Riot API
   */
  async getAccountByPuuid(puuid: string): Promise<AccountDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/riot/account/v1/accounts/by-puuid/${puuid}`, {
          baseURL: this.baseUrl,
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      const baseMessage = 'Failed to retrive data from riot service ';
      const message = error?.response?.data?.status?.message ?? '';
      const status = error?.response?.data?.status?.status_code;
      if (status === 404) {
        throw new NotFoundException(baseMessage + message);
      }
      if (status === 400) {
        throw new BadRequestException(baseMessage + message);
      }
      if (status == null) {
        throw new NotFoundException(baseMessage + message);
      }
      throw new BadGatewayException(baseMessage + message);
    }
  }

  /**
   * Fetches Riot summoner data by PUUID.
   *
   * @param puuid - The player's PUUID (will be URL encoded)
   * @returns Riot summoner data as SummonerDto
   * @throws NotFoundException - If the summoner is not found or status is null
   * @throws BadRequestException - If the request is invalid (400)
   * @throws BadGatewayException - For other errors from Riot API
   */
  async getSummonerByPuuid(puuid: string): Promise<SummonerDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
          baseURL: this.summonerBaseUrl,
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      const baseMessage = 'Failed to retrive data from riot service ';
      const message = error?.response?.data?.status?.message ?? '';
      const status = error?.response?.data?.status?.status_code;
      if (status === 404) {
        throw new NotFoundException(baseMessage + message);
      }
      if (status === 400) {
        throw new BadRequestException(baseMessage + message);
      }
      if (status == null) {
        throw new NotFoundException(baseMessage + message);
      }
      throw new BadGatewayException(baseMessage + message);
    }
  }

  /**
   * Fetches both account and summoner metadata for a given PUUID from Riot API.
   * Calls getAccountByPuuid and getSummonerByPuuid in parallel and returns both results.
   *
   * @param puuid - The player's PUUID (will be URL encoded)
   * @returns RiotPlayerMetadata object containing account and summoner metadata
   * @throws NotFoundException - If either account or summoner is not found or status is null
   * @throws BadRequestException - If the request is invalid (400)
   * @throws BadGatewayException - For other errors from Riot API
   */
  async getPlayerMetadataByPuuid(puuid: string): Promise<RiotPlayerMetadata> {
    const [account, summoner] = await Promise.all([
      this.getAccountByPuuid(puuid),
      this.getSummonerByPuuid(puuid),
    ]);
    return { account, summoner };
  }
}
