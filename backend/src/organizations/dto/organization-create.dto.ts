import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class OrganizationCreateDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'Esports University League',
    type: String,
  })
  @IsString()
  @MinLength(3)
  name: string;
}
