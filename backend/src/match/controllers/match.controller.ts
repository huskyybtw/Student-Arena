import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchService } from '../services/match.service';
import { MatchResponseDto } from '../dto/match-response.dto';
import { MatchQueryDto } from '../interfaces/match-query.dto';

@ApiTags('match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  @ApiOperation({
    summary: 'Find match by Riot match ID or lobby ID',
    description:
      'Retrieves match details including all participants and stats. Provide either riotMatchId or lobbyId query parameter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Match found and returned',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - neither or both parameters provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  async findMatch(@Query() query: MatchQueryDto): Promise<MatchResponseDto> {
    return this.matchService.findMatch(query);
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
}
