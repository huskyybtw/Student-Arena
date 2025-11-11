import { IsOptional } from 'class-validator';
import { QueryParams } from 'src/common/query-params.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { MatchStatus, MatchType } from '@prisma/client';

export class LobbyQueryParams extends QueryParams {
  /**
   * Filter lobbies by status
   */
  @ApiPropertyOptional({
    description: 'Filter lobbies by status',
    enum: MatchStatus,
    example: MatchStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  /**
   * Filter lobbies by match type
   */
  @ApiPropertyOptional({
    description: 'Filter lobbies by match type',
    enum: MatchType,
    example: MatchType.Queue,
  })
  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  /**
   * Filter lobbies by ranked status
   */
  @ApiPropertyOptional({
    description: 'Filter lobbies by ranked status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  ranked?: boolean;

  /**
   * Filter lobbies by date from (start of timeframe)
   */
  @ApiPropertyOptional({
    description: 'Filter lobbies with date greater than or equal to this date',
    type: String,
    format: 'date-time',
    example: '2025-11-09T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /**
   * Filter lobbies by date to (end of timeframe)
   */
  @ApiPropertyOptional({
    description: 'Filter lobbies with date less than or equal to this date',
    type: String,
    format: 'date-time',
    example: '2025-11-10T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
