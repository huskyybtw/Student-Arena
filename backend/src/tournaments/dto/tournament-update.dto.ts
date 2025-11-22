import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoundDto } from './tournament-create.dto';

export class TournamentUpdateDto {
  @ApiPropertyOptional({
    description: 'Tournament name',
    example: 'Spring Championship 2024',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tournament description',
    example: 'Annual spring tournament for all divisions',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The date and time when the tournament starts',
    type: String,
    format: 'date-time',
    example: '2025-11-22T15:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startsAt?: Date;
}
