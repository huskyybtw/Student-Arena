import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParams } from 'src/common/query-params.interface';
import { PlayerPostingCreateDto } from './dto/posting-create.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayerPostingService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: QueryParams) {
    return await this.prisma.playerPosting.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: {
        [String(params.sortBy || 'createdAt')]: params.sortOrder || 'desc',
      },
      include: { player: true },
    });
  }

  async create(playerId: number, dto: PlayerPostingCreateDto) {
    return await this.prisma.playerPosting.create({
      data: {
        ...dto,
        playerId,
      },
      include: { player: true },
    });
  }

  async update(id: number, playerId: number, dto: PlayerPostingCreateDto) {
    const posting = await this.prisma.playerPosting.findUnique({
      where: { id },
    });

    if (!posting) {
      throw new NotFoundException('Posting not found');
    }

    if (posting.playerId !== playerId) {
      throw new ForbiddenException('You can only update your own postings');
    }

    return await this.prisma.playerPosting.update({
      where: { id },
      data: dto,
      include: { player: true },
    });
  }

  async delete(id: number, playerId: number) {
    const posting = await this.prisma.playerPosting.findUnique({
      where: { id },
    });

    if (!posting) {
      throw new NotFoundException('Posting not found');
    }

    if (posting.playerId !== playerId) {
      throw new ForbiddenException('You can only delete your own postings');
    }

    return await this.prisma.playerPosting.delete({
      where: { id },
      include: { player: true },
    });
  }
}
