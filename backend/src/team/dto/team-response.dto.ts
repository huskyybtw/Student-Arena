import { PlayerTestFactory } from 'src/player/test/player.factory';
import { PlayerResponseDto } from '../../player/dto/player-response.dto';
import { TeamCreateDto } from './team-create.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto extends TeamCreateDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the team' })
  id: number;

  @ApiProperty({ description: 'The user ID of the team owner', example: 42 })
  ownerId: number;

  @ApiProperty({
    example: 0,
    description: 'rating for a player',
  })
  rating: number;

  @ApiProperty({
    description: 'The list of team members',
    type: [PlayerResponseDto],
    example: [PlayerTestFactory.response()],
  })
  members: PlayerResponseDto[];
}
