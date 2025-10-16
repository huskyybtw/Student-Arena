import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '@prisma/client';
import { TeamCreateDto } from './dto/team-create.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('team')
@Controller('team')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @Get('/')
  async teams() {}
  @Post('/')
  async create(@CurrentUser() user: User, @Body() body: TeamCreateDto) {
    return this.teamService.create(user.id, body);
  }
}
