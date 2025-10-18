import { Injectable } from '@nestjs/common';
import { Prisma, Team } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TeamCreateDto } from './dto/team-create.dto';
import { TeamQueryParams } from './interfaces/team-filter.params';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: TeamQueryParams): Promise<Team[]> {
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
  async create(playerId: number, input: TeamCreateDto): Promise<Team> {
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
}
