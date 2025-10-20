import { TeamInvitation } from '@prisma/client';
import { TeamCreateDto } from '../dto/team-create.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { PlayerTestFactory } from 'src/player/test/player.factory';
import { TeamInvitationResponseDto } from '../dto/team-invitation-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PlayerResponseDto } from 'src/player/dto/player-response.dto';

export class TeamTestFactory {
  static valid(): TeamCreateDto {
    return { name: 'Team Alpha', tag: 'ALP', description: 'A sample team' };
  }
  static invalid() {
    return {
      name: 'Team Alpha',
    };
  }
  static response(): TeamResponseDto {
    return {
      id: 1,
      name: 'Team Alpha',
      tag: 'ALP',
      description: 'A sample team',
      rating: 0,
      ownerId: PlayerTestFactory.response().id,
      members: [PlayerTestFactory.response()],
    };
  }

  static invitationResponse(): TeamInvitationResponseDto {
    return {
      id: 1,
      teamId: 1,
      playerId: 2,
      createdAt: expect.any(Date) as Date,
      expiresAt: expect.any(Date) as Date,
      status: TeamInvitation,
      team: TeamTestFactory.response(),
      player: PlayerTestFactory.response(),
    };
  }

  static validInvitation(): Omit<
    TeamInvitation,
    'id' | 'createdAt' | 'status' | 'team' | 'player'
  > {
    return {
      teamId: 1,
      playerId: 2,
      expiresAt: new Date('2025-10-20T12:00:00.000Z'),
    };
  }
}
