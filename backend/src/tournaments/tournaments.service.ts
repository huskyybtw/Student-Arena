import { BadRequestException, Injectable } from '@nestjs/common';
import { LobbyService } from 'src/match/services/lobby.service';
import { MatchService } from 'src/match/services/match.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamService } from 'src/team/team.service';
import { TournamentCreateDto } from './dto/tournament-create.dto';
import { UserWithPlayer } from 'src/common/current-user.decorator';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamService,
    private readonly organizationService: OrganizationsService,
    private readonly lobbyService: LobbyService,
    private readonly matchService: MatchService,
  ) {}

  async create(user: UserWithPlayer, input: TournamentCreateDto) {
    const organization = await this.organizationService.findOne(
      user.id,
    );

    if(organization === null) {
        throw BadRequestException('You are not a organization');
    }

    for (const round of input.rounds) {
  }
}
