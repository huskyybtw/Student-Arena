import { ApiProperty } from '@nestjs/swagger';
import { PlayerAccount } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PlayerResponseDto } from 'src/player/dto/player-response.dto';

export class AuthCredentialsDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ type: PlayerResponseDto })
  playerAccount: PlayerResponseDto;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty({ example: 'jwt-access-token' })
  accessToken: string;
}
