import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsInt } from 'class-validator';

export class OrganizationUpdateDto {
  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'Esports University League',
    type: String,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'New owner user ID',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  ownerId?: number;
}
