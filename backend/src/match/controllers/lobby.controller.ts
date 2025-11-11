import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LobbyService } from '../services/lobby.service';
import { LobbyPlayersService } from '../services/lobby-players.service';
import { LobbyCreateDTO } from '../dto/lobby-create.dto';
import { LobbyUpdateDTO } from '../dto/lobby-update.dto';
import { LobbyResponseDto } from '../dto/lobby-response.dto';
import { LobbyQueryParams } from '../interfaces/lobby-filter.params';
import { CurrentUser } from 'src/common/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { MatchType } from '@prisma/client';

@ApiTags('lobby')
@Controller('lobby')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly lobbyPlayersService: LobbyPlayersService,
  ) {}

  /**
   * POST /lobby - Create lobby
   * Creates a new game lobby. If matchType is Queue, only the creator joins.
   * If matchType is Team, all 5 team members are added to the lobby.
   * @param user - Authenticated user creating the lobby
   * @param input - Lobby creation data
   * @param teamId - Optional team ID (required for Team match type)
   * @returns Created lobby with players
   */
  @ApiResponse({
    status: 201,
    description: 'Lobby successfully created',
    type: LobbyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or team validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @Post('/')
  async create(
    @CurrentUser() user,
    @Body() input: LobbyCreateDTO,
    @Query() teamId: number,
  ): Promise<LobbyResponseDto> {
    switch (input.matchType) {
      case MatchType.Queue:
        return await this.lobbyService.create(user, input);
      case MatchType.Team:
        return await this.lobbyService.create(user, input, teamId);
      default:
        throw new BadRequestException(
          `Unsupported match type: ${input.matchType}`,
        );
    }
  }

  /**
   * GET /lobby - List lobbies
   * Retrieves a paginated list of lobbies with optional filters.
   * @param params - Query parameters including filters (status, matchType, ranked) and pagination
   * @returns Paginated list of lobbies
   */
  @Get('/')
  @ApiOperation({
    description:
      'Retrieves a paginated list of lobbies with optional filters for status, match type, and ranked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lobbies successfully retrieved',
    type: [LobbyResponseDto],
  })
  async findAll(
    @Query() params: LobbyQueryParams,
  ): Promise<LobbyResponseDto[]> {
    return await this.lobbyService.findAll(params);
  }

  /**
   * GET /lobby/:id - Get lobby details
   * Retrieves detailed information about a specific lobby including owner and all players.
   * @param id - Lobby ID to retrieve
   * @returns Lobby details with owner and players
   */
  @Get('/:id')
  @ApiOperation({
    description:
      'Retrieves detailed information about a specific lobby including owner and all players.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lobby successfully retrieved',
    type: LobbyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found',
  })
  async findOne(@Param('id') id: number): Promise<LobbyResponseDto> {
    const lobby = await this.lobbyService.findOne(id);

    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${id} not found`);
    }

    return lobby;
  }

  /**
   * PATCH /lobby/:id - Update lobby
   * Updates lobby settings. Only the owner can update and only before match starts.
   * @param user - Authenticated user
   * @param id - Lobby ID to update
   * @param input - Partial lobby data to update
   */
  @ApiOperation({
    description:
      'Updates lobby settings. Owner only. Cannot update after match starts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lobby successfully updated',
    type: LobbyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Match has already started',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found',
  })
  @Patch('/:id')
  async update(
    @CurrentUser() user,
    @Param('id') id: number,
    @Body() input: LobbyUpdateDTO,
  ): Promise<LobbyResponseDto> {
    return await this.lobbyService.update(id, user.playerAccount.id, input);
  }

  /**
   * DELETE /lobby/:id - Delete lobby
   * Deletes a lobby if the user is the owner and the match hasn't started yet.
   * @param user - Authenticated user
   * @param id - Lobby ID to delete
   */
  @ApiResponse({
    status: 200,
    description: 'Lobby successfully deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the owner or match has started',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found',
  })
  @HttpCode(200)
  @Delete('/:id')
  async delete(
    @CurrentUser() user,
    @Param('id') id: number,
  ): Promise<LobbyResponseDto> {
    return await this.lobbyService.delete(id, user.playerAccount.id);
  }

  /**
   * POST /lobby/:id/join - Join lobby
   */
  @Post(':id/join')
  async join(@Param('id') id: string) {
    // TODO: GRACZ DOLACZA DO LOBBY DO KTOREJS Z DRUZYN
    // JESLI MATCH TYPE === TEAM MUSI DOLACZYC PELNA DRUZYNA
  }

  /**
   * POST /lobby/:id/leave - Leave lobby
   */
  @Post(':id/leave')
  async leave(@Param('id') id: string) {
    // TODO: GRACZ OPUSZCZA LOBBY ALBO JEST Z NIEGO WYRZUCANY
    // JESLI MATCH TYPE === TEAM MUSI WYJSC PELNA DRUZYNA
  }

  /**
   * POST /lobby/:id/ready - Toggle ready status
   * Toggles the ready status for the authenticated player in the lobby.
   * @param user - Authenticated user
   * @param id - Lobby ID
   */
  @Post('/:id/ready')
  @ApiOperation({
    description:
      'Toggles the ready status of the player in the lobby. Cannot be changed after match starts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ready status successfully toggled',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Match has already started',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found in lobby',
  })
  async ready(
    @CurrentUser() user,
    @Param('id') id: number,
  ): Promise<LobbyResponseDto> {
    return await this.lobbyPlayersService.toggleReady(
      id,
      user.playerAccount.id,
    );
  }

  /**
   * POST /lobby/:id/start - Start match
   * Starts the match if all conditions are met (10 players, all ready, past scheduled time).
   * Only the lobby owner can start the match.
   * @param user - Authenticated user
   * @param id - Lobby ID to start
   */
  @ApiOperation({
    description:
      'Starts the match. Owner only. Requires 10 players, all ready, and past scheduled time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Match successfully started',
    type: LobbyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Not enough players, not all ready, or time not reached',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the lobby owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Lobby not found',
  })
  @Post('/:id/start')
  async start(
    @CurrentUser() user,
    @Param('id') id: number,
  ): Promise<LobbyResponseDto> {
    return await this.lobbyService.startMatch(id, user.playerAccount.id);
  }
}
