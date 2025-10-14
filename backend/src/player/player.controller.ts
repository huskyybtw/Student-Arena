import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/player-create.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayerService } from './player.service';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '@prisma/client';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 200,
    description: 'User registered and JWT access token returned',
    type: PlayerResponseDto,
  })
  @Put('/')
  async upsert(@CurrentUser() user: User, @Body() body: CreatePlayerDto) {
    const result = await this.playerService.findOne({ userId: user.id });
    if (!result) {
      return this.playerService.create(user.id, body.gameName, body.tagLine);
    }
    return this.playerService.update(user.id, body.gameName, body.tagLine);
  }
}
