import { Body, Controller, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/player-create.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayerService } from './player.service';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('player')
@Controller('player')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 200,
    description: 'User registered and JWT access token returned',
    type: PlayerResponseDto,
  })
  @HttpCode(200)
  @Put('/')
  async upsert(@CurrentUser() user: User, @Body() body: CreatePlayerDto) {
    const result = await this.playerService.findOne({ userId: user.id });
    if (!result) {
      return this.playerService.create(user.id, body);
    }
    return this.playerService.update(user.id, body);
  }
}
