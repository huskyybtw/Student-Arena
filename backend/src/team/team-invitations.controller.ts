import {
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
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto[]> {
    return (await this.teamInvitationService.findMany(
      teamId,
    )) as TeamInvitationResponseDto[];
  }
  /**
   * Create a new invitation for a team member.
   */
  @HttpCode(201)
  @Post('/:id')
  async createInvitation(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) playerId: number,
  ): Promise<TeamInvitationResponseDto> {
    const team = await this.teamService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException('Only team owners can create invitations');
    }

    if (team.members.some((member) => member.id === playerId)) {
      throw new BadRequestException('User is already a member of the team');
    }
    return (await this.teamInvitationService.create(
      teamId,
      playerId,
    )) as TeamInvitationResponseDto;
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
    @Param('id', ParseIntPipe) playerId: number,
  ): Promise<TeamInvitationResponseDto> {
    const invitations = await this.teamInvitationService.findMany(teamId);
    const team = await this.teamService.findOne(teamId);
    if (!invitations.some((inv) => inv.playerId === playerId)) {
      throw new BadRequestException(
        `User with id ${playerId} doesnt have and pending invite for ${teamId}`,
      );
    }
    if (user.playerAccount.id === playerId) {
      return (await this.teamInvitationService.accept(
        teamId,
        playerId,
      )) as TeamInvitationResponseDto;
    }
    if (!team || team.ownerId !== user.playerAccount.id) {
      throw new ForbiddenException(
        'You dont have permisions to revoke the invitation',
      );
    }
    return (await this.teamInvitationService.revoke(
      teamId,
      playerId,
    )) as TeamInvitationResponseDto;
  }
  /**
   * Request an invitation to join a team.
   */
  @HttpCode(200)
  @Put('/:id')
  async requestInvitation(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) playerId: number,
    @CurrentUser() user: UserWithPlayer,
  ): Promise<TeamInvitationResponseDto> {
    const team = await this.teamService.findOne(teamId);
    if (playerId === user.playerAccount.id) {
      throw new BadRequestException(
        'You cannot request an invitation for your self',
      );
    }
    if (team?.members.some((member) => member.id === playerId)) {
      throw new BadRequestException('User is already a member of the team');
    }

    return (await this.teamInvitationService.request(
      teamId,
      playerId,
    )) as TeamInvitationResponseDto;
  }
  /**
   * Get all invitations for a team.
   */
  @HttpCode(200)
  @Get('/:id')
  async getInvitations(
    @CurrentUser() user: UserWithPlayer,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) playerId: number,
  ): Promise<TeamInvitationResponseDto> {
    return (await this.teamInvitationService.findForOne(
      teamId,
      playerId,
    )) as TeamInvitationResponseDto;
  }
  /**
   * Remove or leave a team.
   */
  @HttpCode(200)
  @Delete('/:id')
  async removeMember(
    @CurrentUser() user: UserWithPlayer,
    @Param('id', ParseIntPipe) playerId: number,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.findOne(teamId);
    if (!team || !team.members.some((member) => member.id === playerId)) {
      throw new BadRequestException('There are no member with this id');
    }
    if (team.ownerId === playerId) {
      throw new ForbiddenException('You cant leave a team while being a owner');
    }
    if (
      user.playerAccount.id !== playerId &&
      team.ownerId !== user.playerAccount.id
    ) {
      throw new ForbiddenException(
        'You dont have perrmisions to kick players from the team',
      );
    }
    return (await this.teamInvitationService.leave(
      teamId,
      playerId,
    )) as TeamResponseDto;
  }
}
