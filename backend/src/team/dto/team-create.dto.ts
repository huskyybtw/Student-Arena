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
    description: 'Example name for a team',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ABCDE',
    description: 'Tag must be 5 characters long',
  })
  @IsString()
  @MaxLength(5)
  tag: string;
}
