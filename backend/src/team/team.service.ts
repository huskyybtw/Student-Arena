import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TeamCreateDto } from './dto/team-create.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, input: TeamCreateDto) {
    return await this.prisma.team.create({
      data: {
        ...input,
        ownerId: userId,
        members: {
          connect: [{ id: userId }],
        },
      },
      // DO ZASTANOWIENIA SIE CZY TU NIE TRZEBA UZYWAC PLAYER ID JEDNAK
      include: {
        members: true,
      },
    });
  }
}
