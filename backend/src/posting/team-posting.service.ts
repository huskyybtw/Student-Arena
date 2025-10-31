import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParams } from 'src/common/query-params.interface';
import { TeamPostingCreateDto } from './dto/posting-create.dto';

@Injectable()
export class TeamPostingService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: QueryParams) {
    return await this.prisma.teamPosting.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: {
        [String(params.sortBy || 'createdAt')]: params.sortOrder || 'desc',
      },
      include: { team: { include: { members: true } } },
    });
  }

  async create(playerId: number, dto: TeamPostingCreateDto) {
    // Check if team exists and player owns it
    const team = await this.prisma.team.findUnique({
      where: { id: dto.teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== playerId) {
      throw new ForbiddenException(
        'You can only create postings for teams you own',
      );
    }

    return await this.prisma.teamPosting.create({
      data: {
        title: dto.title,
        description: dto.description,
        rolesNeeded: dto.rolesNeeded,
        teamId: dto.teamId,
      },
      include: { team: { include: { members: true } } },
    });
  }

  async update(id: number, playerId: number, dto: TeamPostingCreateDto) {
    const posting = await this.prisma.teamPosting.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!posting) {
      throw new NotFoundException('Posting not found');
    }

    if (posting.team.ownerId !== playerId) {
      throw new ForbiddenException(
        'You can only update postings for teams you own',
      );
    }

    return await this.prisma.teamPosting.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        rolesNeeded: dto.rolesNeeded,
      },
      include: { team: { include: { members: true } } },
    });
  }

  async delete(id: number, playerId: number) {
    const posting = await this.prisma.teamPosting.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!posting) {
      throw new NotFoundException('Posting not found');
    }

    if (posting.team.ownerId !== playerId) {
      throw new ForbiddenException(
        'You can only delete postings for teams you own',
      );
    }

    return await this.prisma.teamPosting.delete({
      where: { id },
      include: { team: { include: { members: true } } },
    });
  }
}
