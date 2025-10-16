import { ApiProperty } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Husky', description: 'Riot Games Player GameName' })
  @IsString()
  gameName: string;

  @ApiProperty({ example: '5607', description: 'Riot Games Player TagLine' })
  @IsString()
  tagLine: string;

  @ApiProperty({
    example: LeagueRole.TOP,
    description: 'primary role declared by player',
  })
  @IsEnum(LeagueRole)
  primaryRole: LeagueRole;

  @ApiProperty({
    example: LeagueRole.MID,
    description: 'primary role declared by player',
  })
  @IsEnum(LeagueRole)
  secondaryRole: LeagueRole;

  @ApiProperty({
    example: 'i like games',
    description: 'description for users profile',
  })
  @IsString()
  description: string;
}
