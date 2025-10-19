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

  async findOne(
    id: number,
  ): Promise<(Team & { members: PlayerAccount[] }) | null> {
    return await this.prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  }
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
}
