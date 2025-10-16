import { Body, Controller, Get, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '@prisma/client';
import { TeamCreateDto } from './dto/team-create.dto';

@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService){}
    @Get('/')
    async teams(){
 
    }
    @Post('/')
    async create(@CurrentUser() user: User, @Body() body: TeamCreateDto ){
        return this.teamService.create(user.id, body)
    }
}
