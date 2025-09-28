import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthCredentialsDto } from '../auth/dto/auth.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async update(@CurrentUser() user: User, @Body() dto: AuthCredentialsDto) {
    return this.userService.update(user.id, dto);
  }
}
