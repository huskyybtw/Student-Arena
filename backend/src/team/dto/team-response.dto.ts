import { PlayerResponseDto } from '../../player/dto/player-response.dto';
import { TeamCreateDto } from './team-create.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto extends TeamCreateDto {
  @ApiProperty({ description: 'The user ID of the team owner', example: 42 })
  ownerId: number;

  @ApiProperty({
    description: 'The list of team members',
    type: [PlayerResponseDto],
    example: [],
  })
  members: PlayerResponseDto[];
}
