import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { MatchStatus } from '@prisma/client';

/**
 * Webhook payload from tracking service
 */
export class MatchWebhookDto {
  @ApiProperty({
    example: 123,
    description: 'Lobby ID',
  })
  @IsInt()
  lobby_id: number;

  @ApiProperty({
    example: MatchStatus.ONGOING,
    description: 'Match status',
    enum: MatchStatus,
  })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiProperty({
    example: 'EUW1_1234567890',
    description: 'Riot match ID',
  })
  @IsString()
  match_id: string;

  @ApiProperty({
    example: 1800,
    description: 'Game duration in seconds',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  game_duration?: number;

  @ApiProperty({
    example: 'CLASSIC',
    description: 'Game mode',
    required: false,
  })
  @IsOptional()
  @IsString()
  game_mode?: string;
}
