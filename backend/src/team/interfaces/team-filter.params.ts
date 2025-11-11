import { IsOptional } from 'class-validator';
import { QueryParams } from 'src/common/query-params.interface';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class TeamQueryParams extends QueryParams {
  /**
   * Filter teams by owner user ID
   */
  @ApiPropertyOptional({
    description: 'Filter teams by owner user ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  ownerId?: number;

  /**
   * Filter teams by member user IDs
   */
  @ApiPropertyOptional({
    description: 'Filter teams by member user IDs',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  members?: number[];
}
