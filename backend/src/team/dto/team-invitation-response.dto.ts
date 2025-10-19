import { ApiProperty } from '@nestjs/swagger';
import { TeamResponseDto } from './team-response.dto';
import { PlayerResponseDto } from 'src/player/dto/player-response.dto';
import { TeamTestFactory } from '../test/team.factory';
import { PlayerTestFactory } from 'src/player/test/player.factory';

export class TeamInvitationResponseDto {
  @ApiProperty({ example: 1, description: 'Invitation ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'Team ID' })
  teamId: number;

  @ApiProperty({ example: 1, description: 'Player ID' })
  playerId: number;

  @ApiProperty({
    example: '2025-10-19T12:00:00.000Z',
    description: 'Creation date of the invitation',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-20T12:00:00.000Z',
    description: 'Expiration date of the invitation',
  })
  expiresAt: Date;

  @ApiProperty({
    example: 'pending',
    description: 'Status of the invitation (pending, accepted, declined)',
  })
  status: 'pending' | 'accepted' | 'declined';

  @ApiProperty({
    type: TeamResponseDto,
    description: 'Team object for this invitation',
    example: TeamTestFactory.response(),
  })
  team: TeamResponseDto;

  @ApiProperty({
    type: PlayerResponseDto,
    description: 'Player object for this invitation',
    example: PlayerTestFactory.response(),
  })
  player: PlayerResponseDto;
}
