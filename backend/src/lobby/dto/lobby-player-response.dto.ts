import { ApiProperty } from '@nestjs/swagger';
import { PlayerResponseDto } from '../../player/dto/player-response.dto';

export class LobbyPlayerResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the lobby player record',
  })
  id: number;

  @ApiProperty({
    example: 3,
    description: 'ID of the lobby',
  })
  lobbyId: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the player account',
    type: Number,
    nullable: true,
  })
  playerId?: number | null;

  @ApiProperty({
    example: 1,
    description: 'Team number (1 or 2)',
  })
  team: number;

  @ApiProperty({
    example: false,
    description: 'Whether the player is ready',
  })
  ready: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when player joined the lobby',
  })
  joinedAt: Date;

  @ApiProperty({
    description: 'Player account details',
    type: PlayerResponseDto,
    nullable: true,
  })
  player?: PlayerResponseDto | null;
}
