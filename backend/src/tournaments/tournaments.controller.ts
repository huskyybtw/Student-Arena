import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TournamentsService } from './tournaments.service';
import { TournamentResponseDto } from './dto/tournament-response.dto';
import { TournamentCreateDto } from './dto/tournament-create.dto';
import { TournamentUpdateDto } from './dto/tournament-update.dto';
import { TournamentQueryParams } from './interfaces/tournament-query.params';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';

@ApiTags('tournaments')
@Controller('tournaments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of tournaments based on query parameters',
    type: [TournamentResponseDto],
  })
  @HttpCode(200)
  @Get('/')
  async tournaments(
    @Query() params: TournamentQueryParams,
  ): Promise<TournamentResponseDto[]> {
    return this.tournamentsService.findMany(
      params,
    ) as unknown as TournamentResponseDto[];
  }

  @ApiParam({ name: 'id', description: 'Tournament ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Retrieve tournament data for a given id',
    type: TournamentResponseDto,
  })
  @HttpCode(200)
  @Get('/:id')
  async tournament(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TournamentResponseDto> {
    const tournament = await this.tournamentsService.findOne(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament as unknown as TournamentResponseDto;
  }

  @ApiBody({ type: TournamentCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Create a new tournament',
    type: TournamentResponseDto,
  })
  @HttpCode(201)
  @Post('/')
  async create(
    @CurrentUser() user: UserWithPlayer,
    @Body() input: TournamentCreateDto,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.create(
      user,
      input,
    ) as unknown as TournamentResponseDto;
  }

  @ApiParam({ name: 'id', description: 'Tournament ID', type: Number })
  @ApiBody({ type: TournamentUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Update an existing tournament',
    type: TournamentResponseDto,
  })
  @HttpCode(200)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserWithPlayer,
    @Body() input: TournamentUpdateDto,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.update(
      user,
      id,
      input,
    ) as unknown as TournamentResponseDto;
  }

  @ApiParam({ name: 'id', description: 'Tournament ID', type: Number })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Join a tournament with a team',
    type: TournamentResponseDto,
  })
  @HttpCode(200)
  @Post('/:id/join/:teamId')
  async join(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.join(
      user,
      id,
      teamId,
    ) as unknown as TournamentResponseDto;
  }

  @ApiParam({ name: 'id', description: 'Tournament ID', type: Number })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Leave a tournament with a team',
    type: TournamentResponseDto,
  })
  @HttpCode(200)
  @Post('/:id/leave/:teamId')
  async leave(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TournamentResponseDto> {
    return this.tournamentsService.leave(
      user,
      id,
      teamId,
    ) as unknown as TournamentResponseDto;
  }
}
