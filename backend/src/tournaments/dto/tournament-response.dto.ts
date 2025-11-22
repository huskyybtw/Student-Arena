import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { LobbyResponseDto } from 'src/match/dto/lobby-response.dto';

export class TournamentResponseDto {
  @ApiProperty({ description: 'Tournament ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tournament name',
    example: 'Spring Championship 2024',
  })
  name: string;

  @ApiProperty({
    description: 'Tournament description',
    example: 'Annual spring tournament for all divisions',
  })
  description: string;

  @ApiProperty({ description: 'Timestamp when tournament was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when tournament was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Timestamp when tournament starts' })
  startsAt: Date;

  @ApiProperty({
    description: 'ID of the organization hosting the tournament',
    example: 1,
  })
  organizationId: number;

  @ApiProperty({
    description: 'Maximum number of teams allowed in the tournament',
    example: 16,
  })
  teamLimit: number;

  @ApiProperty({
    description: 'List of lobbies/matches in the tournament',
    type: [LobbyResponseDto],
  })
  lobbies: LobbyResponseDto[];

  @ApiProperty({ description: 'Organization hosting the tournament' })
  organization: Organization;
}
