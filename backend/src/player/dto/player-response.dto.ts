import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { CreatePlayerDto } from './player-create.dto';

export class PlayerResponseDto extends CreatePlayerDto {
  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the player account',
  })
  id: number;

  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the user account',
  })
  userId: number;

  @ApiProperty({
    example: '12345-unique-puuid',
    description: 'Player unique identifier from Riot API',
  })
  puuid: string;

  @ApiProperty({ example: 123, description: 'Profile icon ID of the player' })
  profileIconId: number;

  @ApiProperty({ example: 30, description: 'Summoner level of the player' })
  summonerLevel: number;
}
