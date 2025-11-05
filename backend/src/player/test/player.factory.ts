import { LeagueRole } from '@prisma/client';
import { CreatePlayerDto } from '../dto/player-create.dto';
import { PlayerResponseDto } from '../dto/player-response.dto';

export class PlayerTestFactory {
  static valid(): CreatePlayerDto {
    return {
      gameName: 'Husky',
      tagLine: '5607',
      primaryRole: LeagueRole.CARRY,
      secondaryRole: LeagueRole.SUPPORT,
      description: 'Test description',
    };
  }
  static invalid(): CreatePlayerDto {
    return {
      gameName: 'NonExistentGameName',
      tagLine: '0000',
      primaryRole: LeagueRole.CARRY,
      secondaryRole: LeagueRole.SUPPORT,
      description: 'Test description',
    };
  }
  static response(): PlayerResponseDto {
    return {
      rating: 1000,
      description: '',
      gameName: null,
      id: 1,
      primaryRole: null,
      profileIconId: null,
      puuid: null,
      secondaryRole: null,
      summonerLevel: null,
      tagLine: null,
      userId: 1,
    };
  }
  static preCreated(): PlayerResponseDto {
    return {
      rating: 1000,
      description: '',
      gameName: null,
      id: 1,
      primaryRole: null,
      profileIconId: null,
      puuid: null,
      secondaryRole: null,
      summonerLevel: null,
      tagLine: null,
      userId: 1,
    };
  }
  static validPuid() {
    return 'Wd5djJX2bD0wsNqz7JU0i6R59fUZxZThD--VLf5SIQziABg2agpahRiMjlPLuuqvFbEof0O4IegRwg';
  }
  static inValidPuid() {
    return 'Wd5djJX2bD0wsNqz7JU0i6R59fUZxZThD--VLf5SIQziABg2agpahRiMjlPLuuqvFbEof0O4Ieg123';
  }
  static profileIcon() {
    return {
      profileIconId: 6923,
    };
  }
}
