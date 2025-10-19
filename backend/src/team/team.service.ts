import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlayerAccount, Prisma, Team } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TeamCreateDto } from './dto/team-create.dto';
import { TeamQueryParams } from './interfaces/team-filter.params';
import { TeamUpdateDto } from './dto/team-update.dto';
import { PlayerService } from 'src/player/player.service';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Find many teams based on query parameters.
   * @param params Query parameters for filtering, sorting, and pagination
   * @returns Array of teams with their members
   */
  async findMany(
    params: TeamQueryParams,
  ): Promise<Array<Team & { members: PlayerAccount[] }>> {
    const { filters } = params;
    const where: Prisma.TeamWhereInput = {};
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }
    if (filters?.members && filters.members.length > 0) {
      where.members = {
        some: {
          id: { in: filters.members },
        },
      };
    }

    return await this.prisma.team.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [String(params.sortBy || 'name')]: params.sortOrder || 'asc' },
      include: { members: true },
    });
  }

  /**
   * Find a single team by its ID, including members.
   * @param id Team ID
   * @returns The team with members, or null if not found
   */
  async findOne(
    id: number,
  ): Promise<(Team & { members: PlayerAccount[] }) | null> {
    return await this.prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  }
  /**
   * Create a new team and connect the owner as a member.
   * @param playerId The player account ID of the owner
   * @param input Data for creating the team
   * @returns The created team with members
   */
  async create(
    playerId: number,
    input: TeamCreateDto,
  ): Promise<Team & { members: PlayerAccount[] }> {
    return await this.prisma.team.create({
      data: {
        ...input,
        ownerId: playerId,
        members: {
          connect: [{ id: playerId }],
        },
      },
      include: {
        members: true,
      },
    });
  }

  /**
   * Update an existing team.
   * @param teamId The team ID
   * @param input Data for updating the team
   * @returns The updated team with members
   * @throws BadRequestException if new owner does not exist
   */
  async update(teamId: number, input: TeamUpdateDto): Promise<Team> {
    if (input.ownerId) {
      const player = await this.playerService.findOne({
        userId: input.ownerId,
      });

      if (!player) throw new BadRequestException('New owner does not exist');
    }
    return await this.prisma.team.update({
      where: { id: teamId },
      data: { ...input },
      include: { members: true },
    });
  }

  /**
   * Remove (delete) a team by its ID.
   * @param teamId The team ID
   * @returns The deleted team object
   * @throws PrismaClientKnownRequestError (P2025) if not found
   */
  async remove(teamId: number): Promise<Team> {
    return await this.prisma.team.delete({
      where: { id: teamId },
      include: { members: true },
    });
  }
}
