import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';

export class LobbyUpdateDTO {
  @ApiPropertyOptional({
    example: 'Friendly Match',
    description: 'The title of the lobby',
    type: String,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'A casual match for fun.',
    description: 'The description of the lobby',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the match is ranked',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  ranked?: boolean;

  @ApiPropertyOptional({
    example: '2025-11-09T15:00:00.000Z',
    description: 'The date and time of the match',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @MinDate(new Date(), {
    message: 'Match date must be in the future',
  })
  @IsOptional()
  date?: Date;
}
