import {
  Body,
  Controller,
  Get,
  HttpCode,
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
  async teams(@Query() params: TeamQueryParams) {
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
  ) {
    return this.teamService.create(user.playerAccount.id, body);
  }
}
