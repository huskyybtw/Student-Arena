import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus, MatchType } from '@prisma/client';

export class LobbyResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the lobby',
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'Friendly Match',
    description: 'The title of the lobby',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'A casual match for fun.',
    description: 'The description of the lobby',
    type: String,
  })
  description: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the match is ranked',
    type: Boolean,
  })
  ranked: boolean;

  @ApiProperty({
    example: MatchStatus.SCHEDULED,
    description: 'Current status of the lobby',
    enum: MatchStatus,
  })
  status: MatchStatus;

  @ApiProperty({
    example: MatchType.Queue,
    description: 'The type of the match',
    enum: MatchType,
  })
  matchType: MatchType;

  @ApiProperty({
    example: '2025-11-09T15:00:00.000Z',
    description: 'The date and time of the match',
    type: String,
    format: 'date-time',
  })
  date: Date;

  @ApiProperty({
    example: '2025-11-09T12:00:00.000Z',
    description: 'Timestamp when the lobby was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-09T14:00:00.000Z',
    description: 'Timestamp when the lobby was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID of the player who owns the lobby',
    type: Number,
    nullable: true,
  })
  ownerId?: number | null;
}
