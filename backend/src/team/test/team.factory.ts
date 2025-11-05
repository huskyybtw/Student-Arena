import { InvitationStatus, TeamInvitation } from '@prisma/client';
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
      createdAt: expect.any(String) as any,
      status: InvitationStatus.PENDING,
      team: {
        id: 1,
        name: 'Team Alpha',
        tag: 'ALP',
        description: 'A sample team',
        rating: 0,
        ownerId: 1,
        members: [
          {
            id: 1,
            userId: 1,
            description: '',
            rating: 1000,
            primaryRole: null,
            secondaryRole: null,
            gameName: null,
            tagLine: null,
            puuid: null,
            profileIconId: null,
            summonerLevel: null,
          },
        ],
      },
      player: {
        id: 2,
        userId: 2,
        description: '',
        rating: 1000,
        primaryRole: null,
        secondaryRole: null,
        gameName: null,
        tagLine: null,
        puuid: null,
        profileIconId: null,
        summonerLevel: null,
      },
    };
  }

  static validInvitation(): Omit<
    TeamInvitation,
    'id' | 'createdAt' | 'team' | 'player'
  > {
    return {
      teamId: 1,
      playerId: 2,
      status: InvitationStatus.PENDING,
    };
  }
}
