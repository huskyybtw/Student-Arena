import { LeagueRole, PostingStatus } from '@prisma/client';
import {
  PlayerPostingCreateDto,
  TeamPostingCreateDto,
} from '../dto/posting-create.dto';
import {
  PlayerPostingResponseDto,
  TeamPostingResponseDto,
} from '../dto/posting-response.dto';
import { TeamTestFactory } from 'src/team/test/team.factory';
import { PlayerTestFactory } from 'src/player/test/player.factory';

export class TeamPostingFactory {
  static valid(): TeamPostingCreateDto {
    return {
      teamId: 1,
      title: 'Looking for Carry and Support',
      rolesNeeded: [LeagueRole.CARRY, LeagueRole.SUPPORT],
      description: 'Competitive team seeking skilled players',
    };
  }

  static invalid() {
    return {
      teamId: 1,
      title: '',
    };
  }

  static response(): TeamPostingResponseDto {
    return {
      id: 1,
      teamId: 1,
      title: 'Looking for Carry and Support',
      rolesNeeded: [LeagueRole.CARRY, LeagueRole.SUPPORT],
      description: 'Competitive team seeking skilled players',
      status: PostingStatus.OPEN,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
      team: TeamTestFactory.response(),
    };
  }
}

export class PlayerPostingFactory {
  static valid(): PlayerPostingCreateDto {
    return {
      title: 'Experienced Mid Laner Looking for Team',
      description: 'Diamond player with 3 years of competitive experience',
    };
  }

  static invalid() {
    return {
      title: '',
    };
  }

  static response(): PlayerPostingResponseDto {
    return {
      id: 1,
      playerId: 1,
      title: 'Experienced Mid Laner Looking for Team',
      description: 'Diamond player with 3 years of competitive experience',
      status: PostingStatus.OPEN,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
      player: PlayerTestFactory.response(),
    };
  }
}
