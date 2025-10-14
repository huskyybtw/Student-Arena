import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Husky', description: 'Riot Games Player GameName' })
  @IsString()
  gameName: string;

  @ApiProperty({ example: '5607', description: 'Riot Games Player TagLine' })
  @IsString()
  tagLine: string;
}
