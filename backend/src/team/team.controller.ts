import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
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
    @Param('id') id: number,
    @CurrentUser() user: UserWithPlayer,
    @Body() body: TeamUpdateDto,
  ) {
    const team = await this.teamService.findOne(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException("You don't have access to update this team");
    }

    return await this.teamService.update(id, body);
  }
}
