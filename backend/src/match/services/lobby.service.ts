import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LobbyCreateDTO } from '../dto/lobby-create.dto';
import { LobbyUpdateDTO } from '../dto/lobby-update.dto';
import { WebhookMatchDTO } from '../dto/webhook-match.dto';
import { Lobby, MatchStatus, Prisma, Match } from '@prisma/client';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { TeamService } from 'src/team/team.service';
import { LobbyQueryParams } from '../interfaces/lobby-filter.params';
import { RiotService } from 'src/riot/riot.service';
import { MatchTrackingService } from './match-tracking.service';
import { SseService } from '../sse/sse.service';
import { LobbyWithRelations } from '../types/lobby-included.type';

@Injectable()
export class LobbyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamService,
    private readonly matchTrackingService: MatchTrackingService,
    private readonly sseService: SseService,
  ) {}

  /**
   * Create a new lobby
   *
   * Creates a game lobby with either the creator only (Queue match) or with all team members (Team match).
   * For Team matches, validates that:
   * - The team exists
   * - The user is a member of the team
   * - The team has exactly 5 members
   *
   * @param user - Authenticated user with player account
   * @param input - Lobby creation data (title, description, matchType, date, etc.)
   * @param teamId - Optional team ID to add all members to the lobby
   * @returns Created lobby with owner and players included
   * @throws Error if team not found, user not a member, or team size is not 5
   */
  async create(
    user: UserWithPlayer,
    input: LobbyCreateDTO,
    teamId?: number,
  ): Promise<LobbyWithRelations> {
    let playersData;

    if (teamId) {
      const team = await this.teamService.findOne(teamId);

      if (!team) {
        throw new Error('Team not found');
      }

      const isMember = team.members.some(
        (member) => member.id === user.playerAccount.id,
      );

      if (!isMember) {
        throw new Error('User is not a member of this team');
      }

      if (team.members.length !== 5) {
        throw new Error('Team must have exactly 5 members');
      }

      playersData = {
        create: team.members.map((member) => ({
          playerId: member.id,
          team: 1,
          ready: false,
        })),
      };
    } else {
      playersData = {
        create: {
          playerId: user.playerAccount.id,
          team: 1,
          ready: false,
        },
      };
    }

    const data = {
      ownerId: user.playerAccount.id,
      ...input,
      players: playersData,
    };

    return await this.prisma.lobby.create({
      data: data,
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Find all lobbies with filters
   *
   * Retrieves a paginated list of lobbies with optional filters.
   * Supports filtering by status, matchType, and ranked.
   *
   * @param params - Query parameters including filters, pagination, sorting
   * @returns Paginated list of lobbies with metadata
   */
  async findAll(params: LobbyQueryParams) {
    const where: Prisma.LobbyWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.matchType) {
      where.matchType = params.matchType;
    }

    if (params.ranked !== undefined) {
      where.ranked = params.ranked;
    }

    if (params.dateFrom || params.dateTo) {
      where.date = {};
      if (params.dateFrom) {
        where.date.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.date.lte = new Date(params.dateTo);
      }
    }

    return this.prisma.lobby.findMany({
      where,
      skip: ((params.page || 1) - 1) * (params.limit || 10),
      take: params.limit || 10,
      orderBy: {
        [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
      },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Find one lobby by ID
   *
   * Retrieves a single lobby with all its relations including owner and players.
   * Returns null if the lobby doesn't exist.
   *
   * @param id - The unique identifier of the lobby
   * @returns Lobby with owner and players included, or null if not found
   */
  async findOne(id: number): Promise<LobbyWithRelations | null> {
    return await this.prisma.lobby.findUnique({
      where: { id },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Update lobby (owner only)
   *
   * Updates lobby settings. Only the owner can update the lobby.
   * Cannot update lobby after the match has started.
   *
   * @param id - The unique identifier of the lobby to update
   * @param userId - The ID of the user attempting to update
   * @param input - Partial lobby data to update
   * @returns Updated lobby with all relations
   * @throws NotFoundException if lobby not found
   * @throws ForbiddenException if user is not the owner
   * @throws BadRequestException if match has already started
   */
  async update(
    id: number,
    userId: number,
    input: LobbyUpdateDTO,
  ): Promise<LobbyWithRelations> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id },
    });

    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    if (lobby.ownerId !== userId) {
      throw new ForbiddenException('Only the lobby owner can update the lobby');
    }

    if (lobby.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException(
        'Cannot update lobby - match has already started',
      );
    }

    return await this.prisma.lobby.update({
      where: { id },
      data: input,
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Delete lobby (owner only)
   *
   * Deletes a lobby if the user is the owner. Only lobbies that haven't started can be deleted.
   *
   * @param id - The unique identifier of the lobby to delete
   * @param userId - The ID of the user attempting to delete the lobby
   * @throws Error if lobby not found, user is not the owner, or match has already started
   */
  async delete(id: number, userId: number): Promise<LobbyWithRelations> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id },
    });

    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    if (lobby.ownerId !== userId) {
      throw new ForbiddenException('Only the lobby owner can delete the lobby');
    }

    if (lobby.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException(
        'Cannot delete lobby - match has already started',
      );
    }

    return await this.prisma.lobby.delete({
      where: { id },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Start match when all players ready
   *
   * Validates all conditions before starting a match:
   * - User must be the lobby owner
   * - Lobby must have exactly 10 players
   * - Current time must be past the scheduled match date
   * - All players must be ready
   *
   * @param lobbyId - The unique identifier of the lobby
   * @param userId - The ID of the user attempting to start the match
   * @throws NotFoundException if lobby not found
   * @throws ForbiddenException if user is not the owner
   * @throws BadRequestException if conditions are not met
   * @returns Updated lobby with match started
   */
  async startMatch(
    lobbyId: number,
    userId: number,
  ): Promise<LobbyWithRelations> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    if (lobby.ownerId !== userId) {
      throw new ForbiddenException('Only the lobby owner can start the match');
    }

    // if (lobby.players.length !== 10) {
    //   throw new BadRequestException(
    //     `Cannot start match - need 10 players, currently have ${lobby.players.length}`,
    //   );
    // }

    const now = new Date();
    if (now < lobby.date) {
      throw new BadRequestException(
        'Cannot start match - scheduled time has not been reached yet',
      );
    }

    // const allPlayersReady = lobby.players.every((player) => player.ready);
    // if (!allPlayersReady) {
    //   throw new BadRequestException(
    //     'Cannot start match - not all players are ready',
    //   );
    // }

    if (lobby.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Match has already been started');
    }

    // Extract PUUIDs from all players
    const puuids = lobby.players
      .map((lp) => lp.player?.puuid)
      .filter(
        (puuid): puuid is string => puuid !== null && puuid !== undefined,
      );

    // if (puuids.length !== 10) {
    //   throw new BadRequestException(
    //     'Cannot start match - not all players have valid PUUIDs',
    //   );
    // }

    // Send tracking request to tracking service
    await this.matchTrackingService.trackMatch(lobbyId, puuids);
    // Update lobby status and emit SSE event
    const updatedLobby = await this.prisma.lobby.update({
      where: { id: lobbyId },
      data: {
        status: MatchStatus.STARTING,
      },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    // Emit SSE event to all clients watching this lobby
    this.sseService.emitToLobby(lobbyId, 'lobby:status-changed', {
      lobbyId,
      status: MatchStatus.STARTING,
    });

    return updatedLobby;
  }

  /**
   * Cancel match
   */
  async cancelMatch() {
    // TODO: Implement
  }
}
