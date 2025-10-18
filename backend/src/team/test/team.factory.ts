import { TeamCreateDto } from '../dto/team-create.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { PlayerTestFactory } from 'src/player/test/player.factory';

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
}
