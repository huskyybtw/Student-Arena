import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { TeamService } from './team.service';
import { CurrentUser, UserWithPlayer } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { TeamCreateDto } from './dto/team-create.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamFilters, TeamQueryParams } from './interfaces/team-filter.params';
import { TeamUpdateDto } from './dto/team-update.dto';

@ApiTags('teams')
@Controller('teams')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @ApiQuery({ type: TeamFilters })
  @ApiResponse({
    status: 200,
    description: 'Retrieve a list of teams based on query parameters',
    type: [TeamResponseDto],
  })
  @HttpCode(200)
  @Get('/')
  async teams(@Query() params: TeamQueryParams): Promise<TeamResponseDto[]> {
    return this.teamService.findMany(params);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieve a team data for a given id',
    type: TeamResponseDto,
  })
  @HttpCode(200)
  @Get('/:id')
  async team(@Param('id', ParseIntPipe) id: number): Promise<TeamResponseDto> {
    const team = await this.teamService.findOne(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team as TeamResponseDto;
  }

  @ApiBody({ type: TeamCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Create a new team',
    type: TeamResponseDto,
  })
  @HttpCode(201)
  @Post('/')
  async create(
    @CurrentUser() user: UserWithPlayer,
    @Body() body: TeamCreateDto,
  ): Promise<TeamResponseDto> {
    return this.teamService.create(user.playerAccount.id, body);
  }

  @ApiBody({ type: TeamUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'updates a exsisting team',
    type: TeamResponseDto,
  })
  @HttpCode(200)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserWithPlayer,
    @Body() body: TeamUpdateDto,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.findOne(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException("You don't have access to update this team");
    }

    if (body.ownerId && !team.members.some((m) => m.id === body.ownerId)) {
      throw new BadRequestException('New owner must be a member of the team');
    }
    return (await this.teamService.update(id, body)) as TeamResponseDto;
  }

  @ApiResponse({
    status: 200,
    description: 'delete a team data for a given id',
    type: TeamResponseDto,
  })
  @HttpCode(200)
  @Delete('/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.findOne(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException("You don't have access to update this team");
    }
    return (await this.teamService.remove(id)) as TeamResponseDto;
  }
}
