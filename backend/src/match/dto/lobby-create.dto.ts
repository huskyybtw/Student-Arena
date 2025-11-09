import { MatchType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinDate,
} from 'class-validator';

export class LobbyCreateDTO {
  @ApiProperty({
    example: 'Friendly Match',
    description: 'The title of the lobby',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A casual match for fun.',
    description: 'The description of the lobby',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the match is ranked',
    type: Boolean,
  })
  @IsBoolean()
  ranked: boolean;

  @ApiProperty({
    example: MatchType.Queue,
    description: 'The type of the match',
    enum: MatchType,
  })
  @IsEnum(MatchType)
  matchType: MatchType;

  @ApiProperty({
    example: '2025-11-09T15:00:00.000Z',
    description: 'The date and time of the match',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @MinDate(new Date(), {
    message: 'Match date must be in the future',
  })
  date: Date;
}
