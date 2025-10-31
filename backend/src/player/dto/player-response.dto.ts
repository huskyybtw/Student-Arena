import { ApiProperty } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';

export class PlayerResponseDto {
  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the player account',
  })
  id: number;

  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the user account',
  })
  userId: number;

  @ApiProperty({
    example: 'i like games',
    description: 'description for users profile',
  })
  description: string;

  @ApiProperty({
    example: 1000,
    description: 'rating for a player',
  })
  rating: number;

  @ApiProperty({ example: 'Husky', description: 'Riot Games Player GameName' })
  gameName?: string | null;

  @ApiProperty({ example: '5607', description: 'Riot Games Player TagLine' })
  tagLine?: string | null;

  @ApiProperty({
    example: LeagueRole.TOP,
    description: 'primary role declared by player',
    enum: LeagueRole,
  })
  primaryRole?: LeagueRole | null;

  @ApiProperty({
    example: LeagueRole.MID,
    description: 'primary role declared by player',
    enum: LeagueRole,
  })
  secondaryRole?: LeagueRole | null;

  @ApiProperty({
    example: '12345-unique-puuid',
    description: 'Player unique identifier from Riot API',
  })
  puuid?: string | null;

  @ApiProperty({ example: 123, description: 'Profile icon ID of the player' })
  profileIconId?: number | null;

  @ApiProperty({ example: 30, description: 'Summoner level of the player' })
  summonerLevel?: number | null;
}
