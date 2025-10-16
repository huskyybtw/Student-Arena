import { ApiProperty } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';
import { IsEnum, IsNumber, IsString, MAX, maxLength } from 'class-validator';

export class TeamCreateDto {
  @ApiProperty({
    example: 'Test team name',
    description: 'Example name for a team',
  })
  @IsString()
  name: string;

  @ApiProperty({ example: '5607', description: 'Riot Games Player TagLine' })
  @IsString()
  @maxLength()
  tag: string;

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
}
