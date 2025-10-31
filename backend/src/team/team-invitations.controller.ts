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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TeamInvitationsService } from './team-invitations.service';
import { Http2ServerRequest } from 'http2';
import { CurrentUser, UserWithPlayer } from 'src/common/current-user.decorator';
import { TeamInvitation } from '@prisma/client';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamInvitationResponseDto } from './dto/team-invitation-response.dto';
import { TeamService } from './team.service';

@ApiTags('teams-invitations')
@Controller('teams/:teamId/invitations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class TeamInvitationsController {
  constructor(
    private readonly teamInvitationService: TeamInvitationsService,
    private readonly teamService: TeamService,
  ) {}
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of invitations retrieved successfully',
    type: [TeamInvitationResponseDto],
  })
  @HttpCode(200)
  @Get('/')
  async getTeamInvitations(
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamInvitationResponseDto[]> {
    return (await this.teamInvitationService.findMany(
      teamId,
    )) as TeamInvitationResponseDto[];
  }
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the player to invite',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: TeamInvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Player is already a team member',
  })
  @ApiResponse({
    status: 403,
    description: 'Only team owners can create invitations',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
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
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the player',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted or revoked successfully',
    type: TeamInvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No pending invitation exists',
  })
  @ApiResponse({
    status: 403,
    description:
      'User does not have permission to accept or revoke this invitation',
  })
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
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team to join',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the player requesting to join',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Join request created successfully',
    type: TeamInvitationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot request invitation for yourself or player is already a member',
  })
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
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team (unused in query, but required in route)',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the player',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of invitations retrieved successfully',
    type: [TeamInvitationResponseDto],
  })
  @HttpCode(200)
  @Get('/:id')
  async getInvitations(
    @CurrentUser() user: UserWithPlayer,
    @Param('id', ParseIntPipe) playerId: number,
  ): Promise<TeamInvitationResponseDto[]> {
    return (await this.teamInvitationService.findForOne(
      playerId,
    )) as TeamInvitationResponseDto[];
  }
  @ApiParam({
    name: 'teamId',
    description: 'ID of the team',
    type: Number,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the player to remove',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Player is not a member or owner cannot leave team',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to remove this member',
  })
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
