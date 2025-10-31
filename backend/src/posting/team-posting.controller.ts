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
import { TeamPostingService } from './team-posting.service';
import { QueryParams } from 'src/common/query-params.interface';
import { TeamPostingResponseDto } from './dto/posting-response.dto';
import { TeamPostingCreateDto } from './dto/posting-create.dto';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';
import { TeamPostingFactory } from './test/posting.factory';

@ApiTags('Postings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('posting/team')
export class TeamPostingController {
  constructor(private readonly teamPostingService: TeamPostingService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of team postings',
    type: [TeamPostingResponseDto],
    example: [TeamPostingFactory.example()],
  })
  @HttpCode(200)
  @Get('/')
  async postings(
    @Query() params: QueryParams,
  ): Promise<TeamPostingResponseDto[]> {
    return await this.teamPostingService.findMany(params);
  }

  @ApiBody({ type: TeamPostingCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Team posting created successfully',
    type: TeamPostingResponseDto,
    example: TeamPostingFactory.example(),
  })
  @HttpCode(201)
  @Post('/')
  async create(
    @Body() body: TeamPostingCreateDto,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamPostingResponseDto> {
    return await this.teamPostingService.create(user.playerAccount.id, body);
  }

  @ApiBody({ type: TeamPostingCreateDto })
  @ApiResponse({
    status: 200,
    description: 'Team posting updated successfully',
    type: TeamPostingResponseDto,
    example: TeamPostingFactory.example(),
  })
  @HttpCode(200)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: TeamPostingCreateDto,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamPostingResponseDto> {
    return await this.teamPostingService.update(
      id,
      user.playerAccount.id,
      body,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Team posting deleted successfully',
    type: TeamPostingResponseDto,
    example: TeamPostingFactory.example(),
  })
  @HttpCode(200)
  @Delete('/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamPostingResponseDto> {
    return await this.teamPostingService.delete(id, user.playerAccount.id);
  }
}
