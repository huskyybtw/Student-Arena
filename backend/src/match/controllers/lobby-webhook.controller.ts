import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchService } from '../services/match.service';
import { WebhookMatchDTO } from '../dto/webhook-match.dto';

@ApiTags('webhooks')
@Controller('webhook')
export class LobbyWebhookController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * POST /webhook/match-started - Handle match started webhook from tracking service
   */
  @Post('match-started')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Webhook endpoint called by tracking service when a match starts',
  })
  @ApiResponse({
    status: 200,
    description: 'Match started event processed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Match already exists for this lobby',
  })
  async handleMatchStarted(@Body() data: WebhookMatchDTO) {
    await this.matchService.handleMatchStarted(data);
    return { message: 'Match started event processed successfully' };
  }

  /**
   * POST /webhook/match-completed - Handle match completed webhook from tracking service
   */
  @Post('match-completed')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Webhook endpoint called by tracking service when a match completes',
  })
  @ApiResponse({
    status: 200,
    description: 'Match completed event processed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Match already completed',
  })
  async handleMatchCompleted(@Body() data: WebhookMatchDTO) {
    await this.matchService.handleMatchCompleted(data);
    return { message: 'Match completed event processed successfully' };
  }
}
