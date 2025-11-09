import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';

/**
 * Match participant data in response
 */
export class MatchParticipantResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Match participant ID',
  })
  id: number;

  @ApiProperty({
    example: 123,
    description: 'Player ID',
  })
  playerId: number;

  @ApiProperty({
    example: 'Husky#EUW',
    description: 'Player game name with tagline',
  })
  playerName: string;

  @ApiProperty({
    example: 'abc123xyz',
    description: 'Player PUUID',
  })
  puuid: string;

  @ApiProperty({
    example: 157,
    description: 'Champion ID',
  })
  championId: number;

  @ApiProperty({
    example: LeagueRole.TOP,
    description: 'Player role in the match',
    enum: LeagueRole,
  })
  role: LeagueRole;

  @ApiProperty({
    example: 100,
    description: 'Team ID (100 or 200)',
  })
  teamId: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Kills',
    type: Number,
    nullable: true,
  })
  kills?: number | null;

  @ApiPropertyOptional({
    example: 3,
    description: 'Deaths',
    type: Number,
    nullable: true,
  })
  deaths?: number | null;

  @ApiPropertyOptional({
    example: 15,
    description: 'Assists',
    type: Number,
    nullable: true,
  })
  assists?: number | null;

  @ApiPropertyOptional({
    example: 180,
    description: 'Creep score',
    type: Number,
    nullable: true,
  })
  cs?: number | null;

  @ApiPropertyOptional({
    example: 12500,
    description: 'Gold earned',
    type: Number,
    nullable: true,
  })
  goldEarned?: number | null;

  @ApiPropertyOptional({
    example: [3158, 3009, 3089, 3165, 3135, 3157],
    description: 'Item IDs',
    type: [Number],
    nullable: true,
  })
  items?: number[] | null;

  @ApiPropertyOptional({
    example: [4, 14],
    description: 'Summoner spell IDs',
    type: [Number],
    nullable: true,
  })
  spells?: number[] | null;
}

/**
 * Match response DTO
 */
export class MatchResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Match ID',
  })
  id: number;

  @ApiProperty({
    example: 123,
    description: 'Lobby ID',
  })
  lobbyId: number;

  @ApiProperty({
    example: 'EUW1_1234567890',
    description: 'Riot match ID',
  })
  riotMatchId: string;

  @ApiPropertyOptional({
    example: 1847,
    description: 'Match duration in seconds (null if ongoing)',
    type: Number,
    nullable: true,
  })
  duration?: number | null;

  @ApiPropertyOptional({
    example: 100,
    description: 'Winning team ID (100 or 200, null if ongoing)',
    type: Number,
    nullable: true,
  })
  winningTeam?: number | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Match creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T11:00:47Z',
    description: 'Match last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [MatchParticipantResponseDto],
    description: 'List of match participants',
  })
  participants: MatchParticipantResponseDto[];
}
