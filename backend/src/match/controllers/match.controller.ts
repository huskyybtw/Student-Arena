import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchService } from '../services/match.service';

@ApiTags('matches')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * GET /match/lobby/:lobbyId - Get match by lobby
   */
  // @Get('lobby/:lobbyId')
  async findByLobby() {
    // TODO: Implement
  }

  /**
   * GET /match/player/:playerId - Get player match history
   */
  // @Get('player/:playerId')
  async findPlayerMatches() {
    // TODO: Implement
  }

  /**
   * GET /match/player/:playerId/stats - Get player statistics
   */
  // @Get('player/:playerId/stats')
  async getPlayerStats() {
    // TODO: Implement
  }

  /**
   * POST /match/webhook - Handle match status webhook
   */
  // @Post('webhook')
  async handleWebhook() {
    // TODO: Implement
  }
}
