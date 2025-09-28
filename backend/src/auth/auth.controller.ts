import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  AuthCredentialsDto,
  AuthResponseDto,
  AuthUserDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'JWT access token and user info',
    type: AuthResponseDto,
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() body: AuthCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 201,
    description: 'User registered and JWT access token returned',
    type: AuthResponseDto,
  })
  @Post('register')
  async register(@Body() body: AuthCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.register(body.email, body.password);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Authenticated user',
    type: AuthUserDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user: User): AuthUserDto {
    // Only return safe user fields
    return { id: user.id, email: user.email };
  }
}
