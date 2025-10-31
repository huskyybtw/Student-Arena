import { ApiProperty } from '@nestjs/swagger';
import { PostingStatus } from '@prisma/client';
import { PlayerResponseDto } from 'src/player/dto/player-response.dto';
import { TeamResponseDto } from 'src/team/dto/team-response.dto';
import {
  PlayerPostingCreateDto,
  TeamPostingCreateDto,
} from './posting-create.dto';

export class TeamPostingResponseDto extends TeamPostingCreateDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the posting' })
  id: number;

  @ApiProperty({
    example: PostingStatus.OPEN,
    description: 'Current status of the posting',
    enum: PostingStatus,
  })
  status: PostingStatus;

  @ApiProperty({
    example: '2025-10-31T12:00:00Z',
    description: 'When the posting was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-31T12:00:00Z',
    description: 'When the posting was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The team that created the posting',
    type: TeamResponseDto,
  })
  team: TeamResponseDto;
}

export class PlayerPostingResponseDto extends PlayerPostingCreateDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the posting' })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the player that created the posting',
  })
  playerId: number;

  @ApiProperty({
    example: PostingStatus.OPEN,
    description: 'Current status of the posting',
    enum: PostingStatus,
  })
  status: PostingStatus;

  @ApiProperty({
    example: '2025-10-31T12:00:00Z',
    description: 'When the posting was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-31T12:00:00Z',
    description: 'When the posting was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The player that created the posting',
    type: PlayerResponseDto,
  })
  player: PlayerResponseDto;
}
