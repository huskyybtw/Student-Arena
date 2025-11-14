import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QueryParams } from 'src/common/query-params.interface';
import { TournamentResponseDto } from './dto/tournament-response.dto';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService) {}

  @Get('/')
  async tournaments(
    @Query() params: QueryParams,
  ): Promise<TournamentResponseDto[]> {}

  @Post('/')
  async create(
    @CurrentUser() user: UserWithPlayer,
    @Body() input,
  ): Promise<TournamentResponse> {
    return await this.tournamentsService.create(user, input);
  }

  @Get('/:id')
  async tournament(@Param('id') id: number): Promise<TournamentResponse> {}

  @Patch('/:id')
  async update(
    @Param('id') id: number,
    @Body() input,
  ): Promise<TournamentResponse> {}

  @Delete('/:id')
  async close(@Param('id') id: number): Promise<TournamentResponse> {}
}
