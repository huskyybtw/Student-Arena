import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CurrentUser, UserWithPlayer } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { TeamCreateDto } from './dto/team-create.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TeamResponseDto } from './dto/team-response.dto';

@ApiTags('teams')
@Controller('teams')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @Get('/')
  async teams() {}

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
    return this.teamService.create(user.id, body);
  }
}
