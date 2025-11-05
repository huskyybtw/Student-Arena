import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/player-create.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayerService } from './player.service';
import { CurrentUser, UserWithPlayer } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { QueryParams } from '../common/query-params.interface';

@ApiTags('player')
@Controller('player')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiQuery({ type: QueryParams })
  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of players based on query parameters',
    type: [PlayerResponseDto],
  })
  @HttpCode(200)
  @Get('/')
  async players(@Query() params: QueryParams): Promise<PlayerResponseDto[]> {
    return this.playerService.findMany(params);
  }

  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 200,
    description: 'User registered and JWT access token returned',
    type: PlayerResponseDto,
  })
  @HttpCode(200)
  @Put('/')
  async upsert(
    @CurrentUser() user: UserWithPlayer,
    @Body() body: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    const response = await this.playerService.upsert(user.id, body);
    return response;
  }
}
