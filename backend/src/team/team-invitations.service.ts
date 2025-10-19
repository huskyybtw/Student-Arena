import { Injectable } from '@nestjs/common';
import { Team, TeamInvitation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeamInvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<TeamInvitation[]> {}
  async findOne(): Promise<TeamInvitation> {}
  async create(): Promise<TeamInvitation> {}
  async accept(): Promise<TeamInvitation> {}
  async revoke(): Promise<TeamInvitation> {}
  async request(): Promise<TeamInvitation> {}
  async leave(): Promise<Team> {}
}
