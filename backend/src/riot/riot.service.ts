import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RiotService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('RIOT_API_KEY')!;
  }
  /// BRAKUJE BASE URL
  async getAccountByRiotId(gameName: string, tagLine: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }

  async getAccountByPuuid(puuid: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`,
        {
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }
}
