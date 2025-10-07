import { Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/player-create.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 201,
    description: 'User registered and JWT access token returned',
    type: PlayerResponseDto,
  })
  @Post('/')
  async create(@Body() body: CreatePlayerDto) {
    return this.playerService.create(body.email, body.password);
  }
}
