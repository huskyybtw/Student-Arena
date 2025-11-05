import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { TeamCreateDto } from './team-create.dto';

export class TeamUpdateDto extends TeamCreateDto {
  @ApiPropertyOptional({ description: 'Owner user ID', example: 1 })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}
