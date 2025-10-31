import { ApiProperty } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class TeamPostingCreateDto {
  @ApiProperty({
    example: 'Looking for ADC and Support',
    description: 'Title of the team posting',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: ['ADC', 'SUPPORT'],
    description: 'Roles needed for the team',
    enum: LeagueRole,
    isArray: true,
  })
  @IsArray()
  @IsEnum(LeagueRole, { each: true })
  rolesNeeded: LeagueRole[];

  @ApiProperty({
    example: 'We are a competitive team looking for dedicated players',
    description: 'Detailed description of the posting',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PlayerPostingCreateDto {
  @ApiProperty({
    example: 'Experienced Mid Laner Looking for Team',
    description: 'Title of the player posting',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Diamond player with 3 years of competitive experience',
    description: 'Detailed description of the posting',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
