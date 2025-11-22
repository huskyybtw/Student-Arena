import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class TournamentQueryParams {
  @ApiPropertyOptional({ description: 'Page number (starts from 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filter by minimum start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  startsAtFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter by maximum start date',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  startsAtTo?: Date;

  @ApiPropertyOptional({
    description: 'Filter by team limit',
    example: 16,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teamLimit?: number;
}
