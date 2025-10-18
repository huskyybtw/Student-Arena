import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for paginated, filtered, and sorted API endpoints.
 *
 * Includes pagination (page, limit, offset), search, sorting.
 * Used for endpoints that return lists of resources with advanced querying options.
 */
export class QueryParams {
  /**
   * Page number (starts from 1)
   */
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * Number of items per page
   */
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /**
   * Offset for pagination (alternative to page)
   */
  @ApiPropertyOptional({ description: 'Offset for pagination', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  /**
   * Search term for filtering results (applies to name, tag, etc.)
   */
  @ApiPropertyOptional({
    description: 'Search term for filtering results',
    example: 'Alpha',
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Field to sort by (e.g., name, createdAt)
   */
  @ApiPropertyOptional({ description: 'Field to sort by', example: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * Sort order (ascending or descending)
   */
  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
