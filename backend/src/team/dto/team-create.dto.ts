import { ApiProperty } from '@nestjs/swagger';
import { LeagueRole } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  maxLength,
} from 'class-validator';

export class TeamCreateDto {
  @ApiProperty({
    example: 'Test team name',
    description: 'Name of the team',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ABCDE',
    description: 'Tag of the team (max 5 characters)',
  })
  @IsString()
  @MaxLength(5)
  tag: string;

  @ApiProperty({
    example: 'very competitive team focused on climbing the ranks',
    description: 'description displayed on the team detail page',
  })
  @IsString()
  description: string;
}
