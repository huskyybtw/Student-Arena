import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LobbyService } from '../services/lobby.service';

@ApiTags('webhooks')
@Controller('webhooks/match')
export class LobbyWebhookController {
  constructor(private readonly lobbyService: LobbyService) {}

  /**
   * POST /webhooks/match/status - Handle match status updates from tracking service
   */
  // @Post('status')
  async handleMatchStatus() {
    // TODO: Implement
    // 1. Validate webhook data (secret or IP whitelist)
    // 2. Parse MatchWebhookDto
    // 3. Route to appropriate handler based on status
    // 4. Return 200 OK
  }
}
