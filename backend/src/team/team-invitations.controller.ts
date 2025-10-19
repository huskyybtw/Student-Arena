import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamInvitationsService } from './team-invitations.service';
import { Http2ServerRequest } from 'http2';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';
import { TeamInvitation } from '@prisma/client';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamInvitationResponseDto } from './dto/team-invitation-response.dto';
import { TeamService } from './team.service';

@ApiTags('teams')
@Controller('teams/:teamId/invitations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TeamInvitationsController {
  constructor(
    private readonly teamInvitationService: TeamInvitationsService,
    private readonly teamService: TeamService,
  ) {}
  @HttpCode(200)
  @Get('/')
  async getTeamInvitations(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto[]> {
    return (await this.teamInvitationService.findMany()) as TeamInvitationResponseDto[];
  }
  /**
   * Create a new invitation for a team member.
   */
  @HttpCode(201)
  @Post('/:id')
  async createInvitation(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto> {
    return (await this.teamInvitationService.create()) as TeamInvitationResponseDto;
  }
  /**
   * Update an existing invitation for a team member.
   * Used to accept or decline an invitation.
   */
  @HttpCode(200)
  @Patch('/:id')
  async updateInvitation(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto> {
    return (await this.teamInvitationService.accept()) as TeamInvitationResponseDto;
  }
  /**
   * Request an invitation to join a team.
   */
  @HttpCode(200)
  @Put('/:id')
  async requestInvitation(
    @Param('teamId', ParseIntPipe) teamId: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamInvitationResponseDto> {
    const team = await this.teamService.findOne(Number(user.playerAccount.id));
    return (await this.teamInvitationService.request()) as TeamInvitationResponseDto;
  }
  /**
   * Get all invitations for a team.
   */
  @HttpCode(200)
  @Get('/:id')
  async getInvitations(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto> {
    return (await this.teamInvitationService.findOne()) as TeamInvitationResponseDto;
  }
  /**
   * Remove or leave a team.
   */
  @HttpCode(200)
  @Delete('/:id')
  async removeMember(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamResponseDto> {
    return (await this.teamInvitationService.leave()) as TeamResponseDto;
  }
}
