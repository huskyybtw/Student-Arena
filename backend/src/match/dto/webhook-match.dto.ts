import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class WebhookMatchDTO {
  /**
   * Riot Match ID
   */
  @ApiProperty({
    description: 'Riot Match ID from the game',
    example: 'EUW1_1234567890',
  })
  @IsString()
  riotMatchId: string;

  /**
   * Lobby ID that the match belongs to
   */
  @ApiProperty({
    description: 'The lobby ID for this match',
    example: 1,
  })
  @IsInt()
  lobbyId: number;
}
