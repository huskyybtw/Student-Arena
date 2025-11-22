import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class OrganizationResponseDto {
  @ApiProperty({ description: 'Organization ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Organization name',
    example: 'Esports University League',
  })
  name: string;

  @ApiProperty({ description: 'Owner user ID', example: 1 })
  ownerId: number;

  @ApiProperty({ description: 'Organization owner' })
  owner?: User;
}
