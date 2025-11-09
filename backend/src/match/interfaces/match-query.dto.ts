import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for finding a match
 * Provide either riotMatchId OR lobbyId
 */
export class MatchQueryDto {
  @ApiPropertyOptional({
    example: 'EUW1_1234567890',
    description: 'Riot match ID',
  })
  @IsOptional()
  @IsString()
  riotMatchId?: string;

  @ApiPropertyOptional({
    example: 123,
    description: 'Lobby ID',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  lobbyId?: number;
}
