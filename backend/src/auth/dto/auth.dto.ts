import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AuthCredentialsDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'jwt-access-token' })
  accessToken: string;
}
