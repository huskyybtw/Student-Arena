import {
  Injectable,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
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
   * @throws BadGatewayException (502) if tracking service returns an error
   * @throws ServiceUnavailableException (503) if tracking service is unreachable
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
      if (axios.isAxiosError(error) && !error.response) {
        throw new ServiceUnavailableException(
          'Match tracking service is currently unavailable',
        );
      }

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message
        : 'Failed to communicate with tracking service';

      throw new BadGatewayException(`Tracking service error: ${message}`);
    }
  }
}
