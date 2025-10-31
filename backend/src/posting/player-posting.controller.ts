import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PlayerPostingService } from './player-posting.service';
import { QueryParams } from 'src/common/query-params.interface';
import { PlayerPostingResponseDto } from './dto/posting-response.dto';
import { PlayerPostingCreateDto } from './dto/posting-create.dto';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';
import { PlayerPostingFactory } from './test/posting.factory';

@ApiTags('Postings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('posting/player')
export class PlayerPostingController {
  constructor(private readonly playerPostingService: PlayerPostingService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of player postings',
    type: [PlayerPostingResponseDto],
    example: [PlayerPostingFactory.example()],
  })
  @HttpCode(200)
  @Get('/')
  async postings(
    @Query() params: QueryParams,
  ): Promise<PlayerPostingResponseDto[]> {
    return await this.playerPostingService.findMany(params);
  }

  @ApiBody({ type: PlayerPostingCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Player posting created successfully',
    type: PlayerPostingResponseDto,
    example: PlayerPostingFactory.example(),
  })
  @HttpCode(201)
  @Post('/')
  async create(
    @Body() body: PlayerPostingCreateDto,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<PlayerPostingResponseDto> {
    return await this.playerPostingService.create(user.playerAccount.id, body);
  }

  @ApiBody({ type: PlayerPostingCreateDto })
  @ApiResponse({
    status: 200,
    description: 'Player posting updated successfully',
    type: PlayerPostingResponseDto,
    example: PlayerPostingFactory.example(),
  })
  @HttpCode(200)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PlayerPostingCreateDto,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<PlayerPostingResponseDto> {
    return await this.playerPostingService.update(
      id,
      user.playerAccount.id,
      body,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Player posting deleted successfully',
    type: PlayerPostingResponseDto,
    example: PlayerPostingFactory.example(),
  })
  @HttpCode(200)
  @Delete('/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<PlayerPostingResponseDto> {
    return await this.playerPostingService.delete(id, user.playerAccount.id);
  }
}
