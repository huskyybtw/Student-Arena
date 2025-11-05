import { Injectable } from '@nestjs/common';
import {
  InvitationStatus,
  PlayerAccount,
  Team,
  TeamInvitation,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamInvitationWithRelations } from './types/team-invitation-included.type';
import { TeamWithRelations } from './types/team-included.type';

@Injectable()
export class TeamInvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all invitations for a specific team
   */
  async findMany(teamId: number): Promise<TeamInvitationWithRelations[]> {
    return this.prisma.teamInvitation.findMany({
      where: { teamId },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });
  }

  /**
   * Find all invitations for a given player
   */
  async findForOne(playerId: number): Promise<TeamInvitationWithRelations[]> {
    return this.prisma.teamInvitation.findMany({
      where: {
        playerId,
      },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });
  }

  /**
   * Create a new team invitation (owner invites player)
   */
  async create(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations> {
    return this.prisma.teamInvitation.create({
      data: {
        teamId,
        playerId,
        status: InvitationStatus.PENDING,
      },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });
  }

  /**
   * Accept an invitation and add player to team
   */
  async accept(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations> {
    const invitation = await this.prisma.teamInvitation.findFirstOrThrow({
      where: {
        teamId,
        playerId,
      },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });

    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          connect: { id: playerId },
        },
      },
    });

    await this.prisma.teamInvitation.delete({
      where: { id: invitation.id },
    });

    return invitation;
  }

  /**
   * Revoke/decline an invitation
   */
  async revoke(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations> {
    const invitation = await this.prisma.teamInvitation.findFirstOrThrow({
      where: {
        teamId,
        playerId,
      },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });

    await this.prisma.teamInvitation.delete({
      where: { id: invitation.id },
    });

    return invitation;
  }

  /**
   * Create a join request (player requests to join team)
   */
  async request(
    teamId: number,
    playerId: number,
  ): Promise<TeamInvitationWithRelations> {
    return this.prisma.teamInvitation.create({
      data: {
        teamId,
        playerId,
        status: InvitationStatus.REQUESTED,
      },
      include: {
        team: { include: { members: true } },
        player: true,
      },
    });
  }

  /**
   * Remove a player from a team
   */
  async leave(teamId: number, playerId: number): Promise<TeamWithRelations> {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: playerId },
        },
      },
      include: { members: true },
    });
  }
}
