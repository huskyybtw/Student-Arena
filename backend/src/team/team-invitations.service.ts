import { Injectable } from '@nestjs/common';
import { PlayerAccount, Team, TeamInvitation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamTestFactory } from './test/team.factory';
import { TeamInvitationWithRelations } from './types/team-invitation-included.type';
import { TeamWithRelations } from './types/team-included.type';

@Injectable()
export class TeamInvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(teamId: number): Promise<TeamInvitationWithRelations[]> {
    return this.prisma.teamInvitation.findMany({
      where: { teamId },
      include: { team: true, player: true },
    });
  }
  async findForOne(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations[]> {
    return TeamTestFactory.invitationResponse();
  }
  async create(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations[]> {
    return TeamTestFactory.invitationResponse();
  }
  async accept(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations[]> {
    return TeamTestFactory.invitationResponse();
  }
  async revoke(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations[]> {
    return TeamTestFactory.invitationResponse();
  }
  async request(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations[]> {
    return TeamTestFactory.invitationResponse();
  }
  async leave(teamId: number, playerId: number): Promise<TeamWithRelations> {
    return TeamTestFactory.response();
  }
}
