import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class MatchTrackingService {
  private readonly trackingServiceUrl: string;
  private readonly webhookBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.trackingServiceUrl =
      this.configService.get<string>('TRACKING_SERVICE_URL') ||
      'http://localhost:8000';
    this.webhookBaseUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
  }

  /**
   * Send match tracking request to the tracking service
   *
   * Sends a POST request to the tracking service with an array of PUUIDs
   * and webhook URLs for match started/completed events.
   *
   * @param lobbyId - The lobby ID to track
   * @param puuids - Array of player PUUIDs to track
   * @throws HttpException if tracking service request fails
   */
  async trackMatch(lobbyId: number, puuids: string[]): Promise<void> {
    const payload = {
      lobbyId,
      puuids,
      webhooks: {
        matchStarted: `${this.webhookBaseUrl}/webhook/match-started`,
        matchCompleted: `${this.webhookBaseUrl}/webhook/match-completed`,
      },
    };

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.trackingServiceUrl}/track_match`,
          payload,
        ),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || 'Failed to start match tracking',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Failed to communicate with tracking service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
