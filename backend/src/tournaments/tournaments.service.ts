import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LobbyService } from 'src/match/services/lobby.service';
import { MatchService } from 'src/match/services/match.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamService } from 'src/team/team.service';
import { TournamentCreateDto } from './dto/tournament-create.dto';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { TournamentUpdateDto } from './dto/tournament-update.dto';
import { TournamentQueryParams } from './interfaces/tournament-query.params';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationsService,
    private readonly lobbyService: LobbyService,
    private readonly matchService: MatchService,
  ) {}

  /**
   * Create a new tournament
   *
   * Creates a tournament for the user's organization with lobbies based on rounds.
   * Validates that:
   * - User owns an organization
   * - Team limit is calculated as 2^rounds (e.g., 2 rounds = 4 teams, 3 rounds = 8 teams)
   *
   * @param user - Authenticated user with player account
   * @param input - Tournament creation data including name, description, startsAt, and rounds
   * @returns Created tournament with all relations
   * @throws ForbiddenException if user doesn't own an organization
   */
  async create(user: UserWithPlayer, input: TournamentCreateDto) {
    // Check if user owns an organization
    const organization = await this.organizationService.findUsersOrganization(
      user.id,
    );

    if (!organization) {
      throw new ForbiddenException(
        'You must own an organization to create tournaments',
      );
    }

    // Calculate team limit based on number of rounds (2^rounds)
    const teamLimit = Math.pow(2, input.rounds.length);

    // Create the tournament
    const tournament = await this.prisma.tournament.create({
      data: {
        name: input.name,
        description: input.description || '',
        startsAt: input.startsAt,
        teamLimit,
        organizationId: organization.id,
      },
      include: {
        organization: true,
      },
    });

    // Create lobbies for each round
    // Each lobby represents a match in the tournament bracket
    const totalMatches = teamLimit / 2; // Number of matches in first round
    const lobbyPromises: Promise<any>[] = [];

    for (let i = 0; i < totalMatches; i++) {
      const lobbyPromise = this.prisma.lobby
        .create({
          data: {
            title: `${tournament.name} - Match ${i + 1}`,
            description: `Tournament match ${i + 1} for ${tournament.name}`,
            matchType: 'Team',
            date: input.startsAt,
            ranked: true,
          },
        })
        .then((lobby) =>
          this.prisma.tournamentLobby.create({
            data: {
              tournamentId: tournament.id,
              lobbyId: lobby.id,
            },
          }),
        );

      lobbyPromises.push(lobbyPromise);
    }

    await Promise.all(lobbyPromises);

    return this.findOne(tournament.id);
  }

  /**
   * Find many tournaments with filtering and pagination
   *
   * Retrieves a paginated list of tournaments with optional filters.
   * Supports filtering by:
   * - Start time range
   * - Team limit
   *
   * @param params - Query parameters including filters, pagination, and sorting
   * @returns Paginated list of tournaments with organizations
   */
  async findMany(params: TournamentQueryParams) {
    const where: Prisma.TournamentWhereInput = {};

    // Filter by start time
    if (params.startsAtFrom || params.startsAtTo) {
      where.startsAt = {};
      if (params.startsAtFrom) {
        where.startsAt.gte = new Date(params.startsAtFrom);
      }
      if (params.startsAtTo) {
        where.startsAt.lte = new Date(params.startsAtTo);
      }
    }

    // Filter by team limit
    if (params.teamLimit) {
      where.teamLimit = params.teamLimit;
    }

    return this.prisma.tournament.findMany({
      where,
      skip: ((params.page || 1) - 1) * (params.limit || 10),
      take: params.limit || 10,
      orderBy: {
        [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
      },
      include: {
        organization: true,
        lobbies: {
          include: {
            lobby: {
              include: {
                players: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find a single tournament by ID
   *
   * Retrieves a tournament with all nested relations including:
   * - Organization
   * - Lobbies with players
   *
   * @param id - Tournament ID
   * @returns Tournament with all relations or null if not found
   */
  async findOne(id: number) {
    return this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organization: true,
        lobbies: {
          include: {
            lobby: {
              include: {
                players: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update a tournament
   *
   * Updates tournament details. Only the organization owner can update.
   *
   * @param user - Authenticated user with player account
   * @param id - Tournament ID
   * @param input - Tournament update data
   * @returns Updated tournament with all relations
   * @throws NotFoundException if tournament not found
   * @throws ForbiddenException if user is not the organization owner
   */
  async update(user: UserWithPlayer, id: number, input: TournamentUpdateDto) {
    // Find tournament with organization
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Check if user is the organization owner
    if (tournament.organization.ownerId !== user.id) {
      throw new ForbiddenException(
        'Only the organization owner can update tournaments',
      );
    }

    // Update the tournament
    await this.prisma.tournament.update({
      where: { id },
      data: input,
    });

    return this.findOne(id);
  }

  /**
   * Join a tournament with a team
   *
   * Allows a team owner to register their team for a tournament.
   * Validates that:
   * - The tournament exists and hasn't started
   * - The user is the owner of the team
   * - The team has exactly 5 members
   * - The team is not already registered in any lobby of the tournament
   * - There is space available in the tournament
   *
   * @param user - Authenticated user with player account
   * @param id - Tournament ID
   * @param teamId - Team ID to register
   * @returns Updated tournament with all relations
   * @throws NotFoundException if tournament or team not found
   * @throws ForbiddenException if user is not the team owner
   * @throws BadRequestException if tournament has started, team already joined, or team doesn't have 5 members
   */
  async join(user: UserWithPlayer, id: number, teamId: number) {
    // Check if tournament exists with all relations
    const tournamentData = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organization: true,
        lobbies: {
          include: {
            lobby: {
              include: {
                players: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tournamentData) {
      throw new NotFoundException('Tournament not found');
    }

    // TypeScript workaround: Extract base tournament fields explicitly
    const tournament = tournamentData as typeof tournamentData & {
      startsAt: Date;
      teamLimit: number;
      name: string;
    };

    // Check if tournament has started
    const now = new Date();
    if (now >= tournament.startsAt) {
      throw new BadRequestException(
        'Cannot join tournament - tournament has already started',
      );
    }

    // Check if team exists and user is the owner
    const team = await this.teamService.findOne(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException(
        'Only the team owner can register the team for tournaments',
      );
    }

    // Check if team has exactly 5 members
    if (team.members.length !== 5) {
      throw new BadRequestException(
        'Team must have exactly 5 members to join a tournament',
      );
    }

    // Check if team is already registered in any lobby
    const teamMemberIds = team.members.map((member) => member.id);
    const isTeamAlreadyRegistered = tournament.lobbies.some((tournamentLobby) =>
      tournamentLobby.lobby.players.some(
        (lobbyPlayer) =>
          lobbyPlayer.playerId && teamMemberIds.includes(lobbyPlayer.playerId),
      ),
    );

    if (isTeamAlreadyRegistered) {
      throw new BadRequestException(
        'Team is already registered in this tournament',
      );
    }

    // Find the first available lobby (one with less than 2 teams / 10 players)
    let targetLobby = tournament.lobbies.find(
      (tl) => tl.lobby.players.length < 10,
    );

    // If no lobby has space, check if we can create more lobbies
    if (!targetLobby) {
      const currentTeamsCount = tournament.lobbies.reduce(
        (count, tl) => count + tl.lobby.players.length / 5,
        0,
      );

      if (currentTeamsCount >= tournament.teamLimit) {
        throw new BadRequestException(
          'Tournament is full - team limit reached',
        );
      }

      // Create a new lobby for this tournament
      const newLobby = await this.lobbyService.create(
        user,
        {
          title: `${tournament.name} - Match ${tournament.lobbies.length + 1}`,
          description: `Tournament match for ${tournament.name}`,
          matchType: 'Team',
          date: tournament.startsAt,
          ranked: true,
        },
        teamId,
      );

      // Link the lobby to the tournament
      await this.prisma.tournamentLobby.create({
        data: {
          tournamentId: tournament.id,
          lobbyId: newLobby.id,
        },
      });

      return this.findOne(id);
    }

    // Add team members to the existing lobby
    const teamNumber = targetLobby.lobby.players.length < 5 ? 1 : 2;

    await this.prisma.lobbyPlayer.createMany({
      data: team.members.map((member) => ({
        lobbyId: targetLobby.lobby.id,
        playerId: member.id,
        team: teamNumber,
        ready: false,
      })),
    });

    return this.findOne(id);
  }

  /**
   * Leave a tournament with a team
   *
   * Allows a team owner to unregister their team from a tournament.
   * Validates that:
   * - The tournament exists and hasn't started
   * - The user is the owner of the team
   * - The team is actually registered in the tournament
   *
   * @param user - Authenticated user with player account
   * @param id - Tournament ID
   * @param teamId - Team ID to unregister
   * @returns Updated tournament with all relations
   * @throws NotFoundException if tournament or team not found
   * @throws ForbiddenException if user is not the team owner
   * @throws BadRequestException if tournament has started or team is not registered
   */
  async leave(user: UserWithPlayer, id: number, teamId: number) {
    // Check if tournament exists with all relations
    const tournamentData = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organization: true,
        lobbies: {
          include: {
            lobby: {
              include: {
                players: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tournamentData) {
      throw new NotFoundException('Tournament not found');
    }

    // TypeScript workaround: Extract base tournament fields explicitly
    const tournament = tournamentData as typeof tournamentData & {
      startsAt: Date;
      name: string;
    };

    // Check if tournament has started
    const now = new Date();
    if (now >= tournament.startsAt) {
      throw new BadRequestException(
        'Cannot leave tournament - tournament has already started',
      );
    }

    // Check if team exists and user is the owner
    const team = await this.teamService.findOne(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException(
        'Only the team owner can unregister the team from tournaments',
      );
    }

    // Check if team is registered in any lobby and find the lobby
    const teamMemberIds = team.members.map((member) => member.id);
    let targetLobbyId: number | null = null;

    for (const tournamentLobby of tournament.lobbies) {
      const hasTeamMember = tournamentLobby.lobby.players.some(
        (lobbyPlayer) =>
          lobbyPlayer.playerId && teamMemberIds.includes(lobbyPlayer.playerId),
      );

      if (hasTeamMember) {
        targetLobbyId = tournamentLobby.lobby.id;
        break;
      }
    }

    if (!targetLobbyId) {
      throw new BadRequestException(
        'Team is not registered in this tournament',
      );
    }

    // Remove all team members from the lobby
    await this.prisma.lobbyPlayer.deleteMany({
      where: {
        lobbyId: targetLobbyId,
        playerId: {
          in: teamMemberIds,
        },
      },
    });

    return this.findOne(id);
  }
}
